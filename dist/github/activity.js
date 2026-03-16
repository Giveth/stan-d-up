import { octokit } from './client.js';
export async function fetchActivitySummary(config) {
    const prs = [];
    const issues = [];
    for (const repoFull of config.githubRepos) {
        const [owner, repo] = repoFull.split('/');
        if (!owner || !repo)
            continue;
        try {
            // Fetch open PRs
            const { data: prData } = await octokit.pulls.list({
                owner,
                repo,
                state: 'open',
                sort: 'updated',
                direction: 'desc',
                per_page: 5,
            });
            for (const pr of prData) {
                prs.push({
                    repo: `${owner}/${repo}`,
                    title: pr.title,
                    url: pr.html_url,
                    author: pr.user?.login ?? 'unknown',
                });
            }
            // Fetch recently updated open issues
            const { data: issueData } = await octokit.issues.listForRepo({
                owner,
                repo,
                state: 'open',
                sort: 'updated',
                direction: 'desc',
                per_page: 5,
            });
            for (const issue of issueData) {
                // Skip pull requests (they show up in issues endpoint too)
                if (issue.pull_request)
                    continue;
                issues.push({
                    repo: `${owner}/${repo}`,
                    title: issue.title,
                    url: issue.html_url,
                    number: issue.number,
                });
            }
        }
        catch (err) {
            console.warn(`Failed to fetch activity for ${owner}/${repo}: ${err}`);
        }
    }
    return { prs, issues };
}
