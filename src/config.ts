import 'dotenv/config';
import type { Config } from './types.js';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseTimeString(value: string, name: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${name} must be in HH:mm format, got: ${value}`);
  }
  return value;
}

export const config: Config = Object.freeze({
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
});
