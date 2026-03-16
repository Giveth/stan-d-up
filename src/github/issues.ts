import { octokit } from './client.js';

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

export async function searchIssues(owner: string, repo: string, query: string): Promise<IssueSearchResult[]> {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `${query} repo:${owner}/${repo}`,
    per_page: 25,
    sort: 'updated',
    order: 'desc',
  });

  return data.items.map((item) => ({
    owner,
    repo,
    number: item.number,
    title: item.title,
    state: item.state,
    url: item.html_url,
    labels: item.labels.map((l) => (typeof l === 'string' ? l : l.name ?? '')),
    body: item.body ?? null,
  }));
}

export async function getIssue(owner: string, repo: string, number: number): Promise<IssueSearchResult> {
  const { data } = await octokit.issues.get({
    owner,
    repo,
    issue_number: number,
  });

  return {
    owner,
    repo,
    number: data.number,
    title: data.title,
    state: data.state,
    url: data.html_url,
    labels: data.labels.map((l) => (typeof l === 'string' ? l : l.name ?? '')),
    body: data.body ?? null,
  };
}
