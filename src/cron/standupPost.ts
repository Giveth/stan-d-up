import type { Client, TextChannel } from 'discord.js';
import type { Config } from '../types.js';
import { getUpdates } from '../store.js';
import { enrichReferences } from '../github/links.js';
import { fetchActivitySummary } from '../github/activity.js';
import { buildStandupEmbeds } from '../formatters/standupEmbed.js';

export async function postStandup(client: Client, config: Config): Promise<void> {
  const updates = getUpdates();
  const channel = (await client.channels.fetch(config.outputChannelId)) as TextChannel;

  if (!channel) {
    console.error('Output channel not found!');
    return;
  }

  if (updates.length === 0) {
    await channel.send('**Daily Standup** — No updates were submitted today.');
    return;
  }

  // Enrich GitHub references
  for (const update of updates) {
    if (update.githubRefs.length > 0) {
      update.githubRefs = await enrichReferences(update.githubRefs);
    }
  }

  // Fetch GitHub activity summary
  const activitySummary = await fetchActivitySummary(config);

  const embeds = buildStandupEmbeds(updates, activitySummary);

  // Send the first embed with a role mention so everyone gets notified
  const roleMention = `<@&${config.roleId}>`;
  for (let i = 0; i < embeds.length; i++) {
    if (i === 0) {
      await channel.send({ content: roleMention, embeds: [embeds[i]] });
    } else {
      await channel.send({ embeds: [embeds[i]] });
    }
  }

  console.log(`Standup posted with ${updates.length} updates.`);
}
