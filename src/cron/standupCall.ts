import type { Client } from 'discord.js';
import type { Config } from '../types.js';

export async function postStandupCall(client: Client, config: Config): Promise<void> {
  const guild = await client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();
  const roleMembers = members.filter((m) => m.roles.cache.has(config.roleId));

  const channelLink = `<#${config.outputChannelId}>`;

  console.log(`Sending standup call DMs to ${roleMembers.size} members...`);

  for (const [, member] of roleMembers) {
    try {
      await member.send(
        `**Time for the daily standup!** Please post your update in ${channelLink}.`
      );
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`Could not DM ${member.user.tag}: ${err}`);
    }
  }

  console.log('Standup call DMs sent.');
}
