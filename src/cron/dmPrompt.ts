import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import { resetCycle, markPrompted } from '../store.js';

export async function sendDmPrompts(client: Client, config: Config): Promise<void> {
  resetCycle();

  const guild = await client.guilds.fetch(config.guildId);
  const members = await guild.members.fetch();
  const roleMembers = members.filter((m) => m.roles.cache.has(config.roleId));

  console.log(`Sending standup prompts to ${roleMembers.size} members...`);

  for (const [, member] of roleMembers) {
    try {
      await member.send({
        content: [
          '**Good morning! Time for your daily standup update.**',
          '',
          'Please reply with your update. You can:',
          '- Write your update as plain text',
          '- Reference GitHub issues with `owner/repo#123` or paste a full GitHub URL',
          '- Mention other contributors with `@username`',
          '',
          'You can send multiple messages — they will all be included in the standup.',
        ].join('\n'),
      });
      markPrompted(member.id);
      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.warn(`Could not DM ${member.user.tag}: ${err}`);
    }
  }

  console.log('Standup prompts sent.');
}
