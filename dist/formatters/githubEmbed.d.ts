import { EmbedBuilder } from 'discord.js';
import type { GitHubReference } from '../types.js';
export declare function buildGitHubIssueEmbed(ref: GitHubReference & {
    labels?: string[];
    body?: string;
}): EmbedBuilder;
