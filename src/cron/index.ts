import cron from 'node-cron';
import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import { sendDmPrompts } from './dmPrompt.js';
import { postStandup } from './standupPost.js';
import { postStandupCall } from './standupCall.js';

function timeToCron(time: string, days: string): string {
  const [hour, minute] = time.split(':');
  return `${minute} ${hour} * * ${days}`;
}

export function scheduleCronJobs(client: Client, config: Config): void {
  const standupCron = timeToCron(config.standupTime, config.standupDays);

  if (config.asyncMode) {
    // Async mode: DM users for updates, then compile and post
    const dmCron = timeToCron(config.dmTime, config.standupDays);

    cron.schedule(dmCron, () => sendDmPrompts(client, config), {
      timezone: 'Europe/Berlin',
    });

    cron.schedule(standupCron, () => postStandup(client, config), {
      timezone: 'Europe/Berlin',
    });

    console.log(`Async mode: DM prompts at ${config.dmTime} CET, standup at ${config.standupTime} CET (days: ${config.standupDays})`);
  } else {
    // Sync mode: just ping the role at standup time to post in the channel
    cron.schedule(standupCron, () => postStandupCall(client, config), {
      timezone: 'Europe/Berlin',
    });

    console.log(`Sync mode: standup call at ${config.standupTime} CET (days: ${config.standupDays})`);
  }
}
