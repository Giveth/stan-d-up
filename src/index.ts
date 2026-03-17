import { config } from './config.js';
import { client } from './bot.js';
import { setupDmCollector } from './collectors/dmCollector.js';
import { scheduleCronJobs } from './cron/index.js';
import { registerCommands } from './commands/register.js';
import { setupCommandHandler } from './commands/handler.js';

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}`);

  await registerCommands(config);
  setupCommandHandler(client, config);
  scheduleCronJobs(client, config);

  if (config.asyncMode) {
    setupDmCollector(client, config);
    console.log('Standup bot is ready! (async mode)');
  } else {
    console.log('Standup bot is ready! (sync mode)');
  }
});

client.login(config.discordToken);
