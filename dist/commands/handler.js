import * as githubIssue from './githubIssue.js';
import { executeTestPrompt, executeTestStandup, executeStatus } from './admin.js';
export function setupCommandHandler(client, config) {
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
