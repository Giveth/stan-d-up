import { getUpdates } from '../store.js';
import { enrichReferences } from '../github/links.js';
import { fetchActivitySummary } from '../github/activity.js';
import { buildStandupEmbeds } from '../formatters/standupEmbed.js';
export async function postStandup(client, config) {
    const updates = getUpdates();
    const channel = (await client.channels.fetch(config.outputChannelId));
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
    for (const embed of embeds) {
        await channel.send({ embeds: [embed] });
    }
    console.log(`Standup posted with ${updates.length} updates.`);
}
