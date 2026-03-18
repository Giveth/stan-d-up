import cron from 'node-cron';
import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import { sendDmPrompts } from './dmPrompt.js';
import { postStandup } from './standupPost.js';
import { postStandupCall } from './standupCall.js';
import { sendSyncFollowUp } from './syncFollowUp.js';

function timeToCron(time: string, days: string): string {
  const [hour, minute] = time.split(':');
  return `${minute} ${hour} * * ${days}`;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + hours) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
    // Sync mode: DM users to post in the channel, post activity summary
    cron.schedule(standupCron, () => postStandupCall(client, config), {
      timezone: 'Europe/Berlin',
    });

    // Follow-up 2 hours later for anyone who hasn't posted
    const followUpTime = addHours(config.standupTime, 2);
    const followUpCron = timeToCron(followUpTime, config.standupDays);

    cron.schedule(followUpCron, () => sendSyncFollowUp(client, config), {
      timezone: 'Europe/Berlin',
    });

    console.log(`Sync mode: standup call at ${config.standupTime} CET, follow-up at ${followUpTime} CET (days: ${config.standupDays})`);
  }
}
