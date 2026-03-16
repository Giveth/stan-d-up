import { ChannelType } from 'discord.js';
import { isPrompted, addUpdate } from '../store.js';
import { parseGitHubReferences } from '../github/links.js';
export function setupDmCollector(client, _config) {
    client.on('messageCreate', async (message) => {
        // Ignore bots and non-DM channels
        if (message.author.bot)
            return;
        if (message.channel.type !== ChannelType.DM)
            return;
        // Only collect from prompted users
        if (!isPrompted(message.author.id)) {
            await message.reply("I'm not currently collecting standup updates. You'll receive a prompt when it's time!");
            return;
        }
        const githubRefs = parseGitHubReferences(message.content);
        const mentionedUsers = Array.from(message.mentions.users.keys());
        addUpdate({
            userId: message.author.id,
            username: message.author.username,
            displayName: message.author.displayName,
            content: message.content,
            githubRefs,
            mentionedUsers,
            receivedAt: new Date(),
        });
        await message.reply('Got it! Your update has been recorded. You can send more messages to add to your update.');
    });
}
