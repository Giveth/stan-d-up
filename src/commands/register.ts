import { REST, Routes } from 'discord.js';
import type { Config } from '../types.js';
import { data as githubIssueCommand } from './githubIssue.js';
import { testPromptData, testStandupData, statusData } from './admin.js';

export async function registerCommands(config: Config): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.discordToken);

  const commands = [
    githubIssueCommand.toJSON(),
    testPromptData.toJSON(),
    testStandupData.toJSON(),
    statusData.toJSON(),
  ];

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        // Application ID is fetched from the bot's own user
        (await rest.get(Routes.currentApplication()) as { id: string }).id,
        config.guildId
      ),
      { body: commands }
    );
    console.log(`Registered ${commands.length} slash command(s).`);
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
}
