import { EmbedBuilder } from 'discord.js';
import type { Client, TextChannel } from 'discord.js';
import type { Config } from '../types.js';
import { resetSyncCycle, markCalled } from '../store.js';
import { fetchActivitySummary } from '../github/activity.js';

export async function postStandupCall(client: Client, config: Config): Promise<void> {
  resetSyncCycle();

  const guild = await client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();
  const roleMembers = members.filter((m) => m.roles.cache.has(config.roleId));
  const channelLink = `<#${config.outputChannelId}>`;

  // Post GitHub activity summary to the standup channel
  const channel = (await client.channels.fetch(config.outputChannelId)) as TextChannel;
  if (channel) {
    await postActivitySummary(channel, config);
  }

  // DM each role member to go post in the channel
  console.log(`Sending standup call DMs to ${roleMembers.size} members...`);

  for (const [, member] of roleMembers) {
    try {
      await member.send(
        `**Time for the daily standup!** Please post your update in ${channelLink}.`
      );
      markCalled(member.id);
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`Could not DM ${member.user.tag}: ${err}`);
    }
  }

  console.log('Standup call DMs sent.');
}

async function postActivitySummary(channel: TextChannel, config: Config): Promise<void> {
  const activitySummary = await fetchActivitySummary(config);
  const sections: string[] = [];

  if (activitySummary.prs.length > 0) {
    const prList = activitySummary.prs
      .slice(0, 10)
      .map((pr) => `- [${pr.repo}: ${pr.title}](${pr.url}) by ${pr.author}`)
      .join('\n');
    sections.push(`\u{1f501} **Open PRs:**\n${prList}`);
  }

  if (activitySummary.issues.length > 0) {
    const issueList = activitySummary.issues
      .slice(0, 10)
      .map((i) => `- [${i.repo}#${i.number}: ${i.title}](${i.url})`)
      .join('\n');
    sections.push(`\u{1f4dd} **Recent Issues:**\n${issueList}`);
  }

  if (sections.length === 0) return;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let activityValue = sections.join('\n\n');
  if (activityValue.length > 4096) {
    activityValue = activityValue.slice(0, 4093) + '...';
  }

  const embed = new EmbedBuilder()
    .setTitle(`Daily Standup — ${today}`)
    .setDescription(activityValue)
    .setColor(0x5865f2)
    .setFooter({ text: 'Post your updates in this channel!' })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  console.log('GitHub activity summary posted to standup channel.');
}
