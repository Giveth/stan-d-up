import type { GitHubReference } from '../types.js';
export declare function parseGitHubReferences(text: string): GitHubReference[];
export declare function enrichReferences(refs: GitHubReference[]): Promise<GitHubReference[]>;
