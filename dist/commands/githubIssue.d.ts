import { type ChatInputCommandInteraction, type AutocompleteInteraction } from 'discord.js';
import type { Config } from '../types.js';
export declare const data: import("discord.js").SlashCommandOptionsOnlyBuilder;
export declare function autocomplete(interaction: AutocompleteInteraction, config: Config): Promise<void>;
export declare function execute(interaction: ChatInputCommandInteraction, _config: Config): Promise<void>;
