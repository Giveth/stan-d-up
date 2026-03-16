import cron from 'node-cron';
import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import { sendDmPrompts } from './dmPrompt.js';
import { postStandup } from './standupPost.js';

function timeToCron(time: string): string {
  const [hour, minute] = time.split(':');
  return `${minute} ${hour} * * 1-5`;
}

export function scheduleCronJobs(client: Client, config: Config): void {
  const dmCron = timeToCron(config.dmTime);
  const standupCron = timeToCron(config.standupTime);

  cron.schedule(dmCron, () => sendDmPrompts(client, config), {
    timezone: 'Europe/Berlin',
  });

  cron.schedule(standupCron, () => postStandup(client, config), {
    timezone: 'Europe/Berlin',
  });

  console.log(`Cron scheduled: DM prompts at ${config.dmTime} CET, standup at ${config.standupTime} CET (weekdays)`);
}
