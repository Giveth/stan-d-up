import type { Config } from '../types.js';
export interface ActivitySummary {
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
export declare function fetchActivitySummary(config: Config): Promise<ActivitySummary>;
