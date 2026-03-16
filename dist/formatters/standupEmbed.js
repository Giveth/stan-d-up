import { EmbedBuilder } from 'discord.js';
function formatGitHubRef(ref) {
    const label = `${ref.owner}/${ref.repo}#${ref.number}`;
    const title = ref.title ? `: ${ref.title}` : '';
    const state = ref.state ? ` (${ref.state})` : '';
    return `[${label}${title}](${ref.url})${state}`;
}
function formatUpdateField(update) {
    let value = update.content;
    if (update.githubRefs.length > 0) {
        const refs = update.githubRefs.map(formatGitHubRef).join('\n');
        value += `\n\n**Referenced:**\n${refs}`;
    }
    // Truncate to Discord's field value limit
    if (value.length > 1024) {
        value = value.slice(0, 1021) + '...';
    }
    return {
        name: update.displayName,
        value,
    };
}
export function buildStandupEmbeds(updates, activitySummary) {
    const embeds = [];
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    let currentEmbed = new EmbedBuilder()
        .setTitle(`Daily Standup — ${today}`)
        .setColor(0x5865f2)
        .setTimestamp();
    let charCount = 0;
    let fieldCount = 0;
    for (const update of updates) {
        const field = formatUpdateField(update);
        const fieldLength = field.name.length + field.value.length;
        // Split to new embed if approaching limits
        if (charCount + fieldLength > 5500 || fieldCount >= 25) {
            embeds.push(currentEmbed);
            currentEmbed = new EmbedBuilder().setColor(0x5865f2);
            charCount = 0;
            fieldCount = 0;
        }
        currentEmbed.addFields(field);
        charCount += fieldLength;
        fieldCount++;
    }
    // Add activity summary if present
    if (activitySummary) {
        const sections = [];
        if (activitySummary.prs.length > 0) {
            const prList = activitySummary.prs
                .slice(0, 10)
                .map((pr) => `- [${pr.repo}: ${pr.title}](${pr.url}) by ${pr.author}`)
                .join('\n');
            sections.push(`**Open PRs:**\n${prList}`);
        }
        if (activitySummary.issues.length > 0) {
            const issueList = activitySummary.issues
                .slice(0, 10)
                .map((i) => `- [${i.repo}#${i.number}: ${i.title}](${i.url})`)
                .join('\n');
            sections.push(`**Recent Issues:**\n${issueList}`);
        }
        if (sections.length > 0) {
            let activityValue = sections.join('\n\n');
            if (activityValue.length > 1024) {
                activityValue = activityValue.slice(0, 1021) + '...';
            }
            if (charCount + activityValue.length > 5500 || fieldCount >= 25) {
                embeds.push(currentEmbed);
                currentEmbed = new EmbedBuilder().setColor(0x5865f2);
            }
            currentEmbed.addFields({ name: 'GitHub Activity', value: activityValue });
        }
    }
    currentEmbed.setFooter({ text: `${updates.length} update(s) collected` });
    embeds.push(currentEmbed);
    return embeds;
}
