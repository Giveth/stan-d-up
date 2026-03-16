export interface IssueSearchResult {
    owner: string;
    repo: string;
    number: number;
    title: string;
    state: string;
    url: string;
    labels: string[];
    body: string | null;
}
export declare function searchIssues(owner: string, repo: string, query: string): Promise<IssueSearchResult[]>;
export declare function getIssue(owner: string, repo: string, number: number): Promise<IssueSearchResult>;
