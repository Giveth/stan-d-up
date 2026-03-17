export interface Config {
    discordToken: string;
    guildId: string;
    roleId: string;
    dmTime: string;
    standupTime: string;
    outputChannelId: string;
    githubToken: string;
    githubRepos: string[];
    adminUserId: string;
    standupDays: string;
    asyncMode: boolean;
}
export interface GitHubReference {
    owner: string;
    repo: string;
    number: number;
    url: string;
    title?: string;
    state?: string;
    type?: 'issue' | 'pull_request';
}
export interface StandupUpdate {
    userId: string;
    username: string;
    displayName: string;
    content: string;
    githubRefs: GitHubReference[];
    mentionedUsers: string[];
    receivedAt: Date;
}
