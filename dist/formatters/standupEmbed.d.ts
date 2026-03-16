import { EmbedBuilder } from 'discord.js';
import type { StandupUpdate } from '../types.js';
interface ActivitySummary {
    prs: {
        repo: string;
        title: string;
        url: string;
        author: string;
    }[];
    issues: {
        repo: string;
        title: string;
        url: string;
        number: number;
    }[];
}
export declare function buildStandupEmbeds(updates: StandupUpdate[], activitySummary?: ActivitySummary): EmbedBuilder[];
export {};
