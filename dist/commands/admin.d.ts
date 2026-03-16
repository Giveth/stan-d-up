import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { Config } from '../types.js';
export declare const testPromptData: SlashCommandBuilder;
export declare const testStandupData: SlashCommandBuilder;
export declare const statusData: SlashCommandBuilder;
export declare function executeTestPrompt(interaction: ChatInputCommandInteraction, config: Config): Promise<void>;
export declare function executeTestStandup(interaction: ChatInputCommandInteraction, config: Config): Promise<void>;
export declare function executeStatus(interaction: ChatInputCommandInteraction, config: Config): Promise<void>;
