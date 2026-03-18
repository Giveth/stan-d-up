import { Client } from 'discord.js';
import type { Config } from '../types.js';
import { markPostedInChannel } from '../store.js';

export function setupChannelCollector(client: Client, config: Config): void {
  client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.channelId !== config.outputChannelId) return;

    markPostedInChannel(message.author.id);
  });
}
