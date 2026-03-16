import cron from 'node-cron';
import { sendDmPrompts } from './dmPrompt.js';
import { postStandup } from './standupPost.js';
function timeToCron(time, days) {
    const [hour, minute] = time.split(':');
    return `${minute} ${hour} * * ${days}`;
}
export function scheduleCronJobs(client, config) {
    const dmCron = timeToCron(config.dmTime, config.standupDays);
    const standupCron = timeToCron(config.standupTime, config.standupDays);
    cron.schedule(dmCron, () => sendDmPrompts(client, config), {
        timezone: 'Europe/Berlin',
    });
    cron.schedule(standupCron, () => postStandup(client, config), {
        timezone: 'Europe/Berlin',
    });
    console.log(`Cron scheduled: DM prompts at ${config.dmTime} CET, standup at ${config.standupTime} CET (days: ${config.standupDays})`);
}
