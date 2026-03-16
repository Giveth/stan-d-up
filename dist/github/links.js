import { octokit } from './client.js';
const GITHUB_URL_REGEX = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/g;
const SHORTHAND_REGEX = /(?:^|\s)([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)#(\d+)/g;
export function parseGitHubReferences(text) {
    const refs = [];
    const seen = new Set();
    // Match full GitHub URLs
    for (const match of text.matchAll(GITHUB_URL_REGEX)) {
        const [, owner, repo, , number] = match;
        const key = `${owner}/${repo}#${number}`;
        if (!seen.has(key)) {
            seen.add(key);
            refs.push({
                owner,
                repo,
                number: parseInt(number, 10),
                url: `https://github.com/${owner}/${repo}/issues/${number}`,
            });
        }
    }
    // Match shorthand owner/repo#123
    for (const match of text.matchAll(SHORTHAND_REGEX)) {
        const [, ownerRepo, number] = match;
        const [owner, repo] = ownerRepo.split('/');
        const key = `${owner}/${repo}#${number}`;
        if (!seen.has(key)) {
            seen.add(key);
            refs.push({
                owner,
                repo,
                number: parseInt(number, 10),
                url: `https://github.com/${owner}/${repo}/issues/${number}`,
            });
        }
    }
    return refs;
}
export async function enrichReferences(refs) {
    const enriched = [];
    for (const ref of refs) {
        try {
            const { data } = await octokit.issues.get({
                owner: ref.owner,
                repo: ref.repo,
                issue_number: ref.number,
            });
            enriched.push({
                ...ref,
                title: data.title,
                state: data.state,
                type: data.pull_request ? 'pull_request' : 'issue',
                url: data.html_url,
            });
        }
        catch {
            // Keep the ref un-enriched if API fails
            enriched.push(ref);
        }
    }
    return enriched;
}
