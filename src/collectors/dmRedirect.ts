import { Client, ChannelType } from 'discord.js';
import type { Config } from '../types.js';

export function setupDmRedirect(client: Client, config: Config): void {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;

    const channelLink = `<#${config.outputChannelId}>`;
    await message.reply(
      `I'm not accepting standup submissions via DM. Please post your update directly in ${channelLink}.`
    );
  });
}
