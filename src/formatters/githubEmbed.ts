import { EmbedBuilder } from 'discord.js';
import type { GitHubReference } from '../types.js';

export function buildGitHubIssueEmbed(ref: GitHubReference & { labels?: string[]; body?: string }): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`${ref.owner}/${ref.repo}#${ref.number}: ${ref.title ?? 'Unknown'}`)
    .setURL(ref.url)
    .setColor(ref.type === 'pull_request' ? 0x238636 : 0x5865f2);

  if (ref.state) {
    embed.addFields({ name: 'Status', value: ref.state, inline: true });
  }

  if (ref.type) {
    embed.addFields({ name: 'Type', value: ref.type === 'pull_request' ? 'Pull Request' : 'Issue', inline: true });
  }

  if (ref.labels && ref.labels.length > 0) {
    embed.addFields({ name: 'Labels', value: ref.labels.join(', '), inline: true });
  }

  if (ref.body) {
    const truncated = ref.body.length > 300 ? ref.body.slice(0, 297) + '...' : ref.body;
    embed.setDescription(truncated);
  }

  return embed;
}
