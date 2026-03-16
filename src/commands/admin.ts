import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { Config } from '../types.js';
import { sendDmPrompts } from '../cron/dmPrompt.js';
import { postStandup } from '../cron/standupPost.js';
import { getUpdates, isPrompted } from '../store.js';

export const testPromptData = new SlashCommandBuilder()
  .setName('test-prompt')
  .setDescription('Manually trigger the DM standup prompt (admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const testStandupData = new SlashCommandBuilder()
  .setName('test-standup')
  .setDescription('Manually trigger the standup post (admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export const statusData = new SlashCommandBuilder()
  .setName('standup-status')
  .setDescription('Show current standup cycle status (admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function isAdmin(interaction: ChatInputCommandInteraction, config: Config): boolean {
  return interaction.user.id === config.adminUserId;
}

export async function executeTestPrompt(
  interaction: ChatInputCommandInteraction,
  config: Config
): Promise<void> {
  if (!isAdmin(interaction, config)) {
    await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });

  try {
    await sendDmPrompts(interaction.client, config);
    await interaction.editReply('DM prompts sent! Check the console for details.');
  } catch (err) {
    await interaction.editReply(`Failed to send prompts: ${err}`);
  }
}

export async function executeTestStandup(
  interaction: ChatInputCommandInteraction,
  config: Config
): Promise<void> {
  if (!isAdmin(interaction, config)) {
    await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    return;
  }
  await interaction.deferReply({ ephemeral: true });

  try {
    await postStandup(interaction.client, config);
    const updates = getUpdates();
    await interaction.editReply(
      updates.length > 0
        ? `Standup posted with ${updates.length} update(s).`
        : 'Standup posted (no updates were collected).'
    );
  } catch (err) {
    await interaction.editReply(`Failed to post standup: ${err}`);
  }
}

export async function executeStatus(
  interaction: ChatInputCommandInteraction,
  config: Config
): Promise<void> {
  if (!isAdmin(interaction, config)) {
    await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    return;
  }
  const updates = getUpdates();

  const guild = await interaction.client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();
  const roleMembers = members.filter((m) => m.roles.cache.has(config.roleId));

  const prompted = roleMembers.filter((m) => isPrompted(m.id));
  const responded = roleMembers.filter((m) =>
    updates.some((u) => u.userId === m.id)
  );

  const lines = [
    `**Standup Bot Status**`,
    ``,
    `**Role members:** ${roleMembers.size}`,
    `**Prompted this cycle:** ${prompted.size}`,
    `**Responded:** ${responded.size}`,
    ``,
    `**Schedule:** DM at ${config.dmTime} CET / Standup at ${config.standupTime} CET`,
    `**Output channel:** <#${config.outputChannelId}>`,
    `**GitHub repos:** ${config.githubRepos.join(', ') || 'none'}`,
  ];

  if (responded.size > 0) {
    lines.push(``, `**Who responded:**`);
    for (const update of updates) {
      const refs = update.githubRefs.length > 0 ? ` (${update.githubRefs.length} GitHub ref(s))` : '';
      lines.push(`- ${update.displayName}${refs}`);
    }
  }

  if (prompted.size > 0 && prompted.size > responded.size) {
    const pending = roleMembers.filter(
      (m) => isPrompted(m.id) && !updates.some((u) => u.userId === m.id)
    );
    lines.push(``, `**Awaiting response:**`);
    for (const [, member] of pending) {
      lines.push(`- ${member.displayName}`);
    }
  }

  await interaction.reply({ content: lines.join('\n'), ephemeral: true });
}
