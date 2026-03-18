import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import { getCalledButNotPosted } from '../store.js';

export async function sendSyncFollowUp(client: Client, config: Config): Promise<void> {
  const pending = getCalledButNotPosted();

  if (pending.length === 0) {
    console.log('Sync follow-up: everyone has posted, no reminders needed.');
    return;
  }

  const channelLink = `<#${config.outputChannelId}>`;
  console.log(`Sending follow-up DMs to ${pending.length} members who haven't posted...`);

  const guild = await client.guilds.fetch(config.guildId);

  for (const userId of pending) {
    try {
      const member = await guild.members.fetch(userId);
      await member.send(
        `**Friendly reminder!** You haven't posted your standup update yet. Head over to ${channelLink} to share what you're working on.`
      );
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`Could not send follow-up DM to ${userId}: ${err}`);
    }
  }

  console.log('Sync follow-up DMs sent.');
}
