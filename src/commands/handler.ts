import type { Client } from 'discord.js';
import type { Config } from '../types.js';
import * as githubIssue from './githubIssue.js';
import { executeTestPrompt, executeTestStandup, executeStatus } from './admin.js';

export function setupCommandHandler(client: Client, config: Config): void {
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isAutocomplete()) {
      if (interaction.commandName === 'github-issue') {
        await githubIssue.autocomplete(interaction, config);
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case 'github-issue':
          await githubIssue.execute(interaction, config);
          break;
        case 'test-prompt':
          await executeTestPrompt(interaction, config);
          break;
        case 'test-standup':
          await executeTestStandup(interaction, config);
          break;
        case 'standup-status':
          await executeStatus(interaction, config);
          break;
      }
      return;
    }
  });
}
