import 'dotenv/config';
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
const VALID_DAYS = new Set(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
const DAY_TO_CRON = {
    MON: '1', TUE: '2', WED: '3', THU: '4', FRI: '5', SAT: '6', SUN: '0',
};
function parseStandupDays(value) {
    const days = value.split(',').map((d) => d.trim().toUpperCase()).filter(Boolean);
    for (const day of days) {
        if (!VALID_DAYS.has(day)) {
            throw new Error(`Invalid day in STANDUP_DAYS: "${day}". Use: MON,TUE,WED,THU,FRI,SAT,SUN`);
        }
    }
    if (days.length === 0) {
        throw new Error('STANDUP_DAYS must contain at least one day.');
    }
    return days.map((d) => DAY_TO_CRON[d]).join(',');
}
function parseTimeString(value, name) {
    if (!/^\d{2}:\d{2}$/.test(value)) {
        throw new Error(`${name} must be in HH:mm format, got: ${value}`);
    }
    return value;
}
export const config = Object.freeze({
    discordToken: requireEnv('DISCORD_TOKEN'),
    guildId: requireEnv('DISCORD_SERVER_ID'),
    roleId: requireEnv('DISCORD_ROLE_ID'),
    outputChannelId: requireEnv('DISCORD_OUTPUT_CHANNEL_ID'),
    dmTime: parseTimeString(requireEnv('DM_TIME'), 'DM_TIME'),
    standupTime: parseTimeString(requireEnv('STANDUP_TIME'), 'STANDUP_TIME'),
    githubToken: requireEnv('GITHUB_TOKEN'),
    githubRepos: requireEnv('GITHUB_REPOS')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    adminUserId: requireEnv('ADMIN_USER_ID'),
    standupDays: parseStandupDays(process.env['STANDUP_DAYS'] || 'MON,TUE,WED,THU,FRI'),
});
