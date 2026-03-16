import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
} from 'discord.js';
import type { Config } from '../types.js';
import { searchIssues, getIssue } from '../github/issues.js';
import { buildGitHubIssueEmbed } from '../formatters/githubEmbed.js';

export const data = new SlashCommandBuilder()
  .setName('github-issue')
  .setDescription('Look up a GitHub issue or PR from connected repos')
  .addStringOption((option) =>
    option
      .setName('repo')
      .setDescription('Select a repository')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('Search for an issue by title or number')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocomplete(
  interaction: AutocompleteInteraction,
  config: Config
): Promise<void> {
  const focused = interaction.options.getFocused(true);

  if (focused.name === 'repo') {
    const filtered = config.githubRepos
      .filter((r) => r.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25);
    await interaction.respond(filtered.map((r) => ({ name: r, value: r })));
    return;
  }

  if (focused.name === 'query') {
    const repo = interaction.options.getString('repo');
    if (!repo || !repo.includes('/')) {
      await interaction.respond([]);
      return;
    }

    const [owner, repoName] = repo.split('/');
    const query = focused.value || 'is:open';

    try {
      const results = await searchIssues(owner, repoName, query);
      await interaction.respond(
        results.slice(0, 25).map((r) => ({
          name: `#${r.number}: ${r.title}`.slice(0, 100),
          value: `${r.number}`,
        }))
      );
    } catch {
      await interaction.respond([]);
    }
    return;
  }
}

export async function execute(
  interaction: ChatInputCommandInteraction,
  _config: Config
): Promise<void> {
  const repoFull = interaction.options.getString('repo', true);
  const issueNumber = parseInt(interaction.options.getString('query', true), 10);

  if (!repoFull.includes('/') || isNaN(issueNumber)) {
    await interaction.reply({ content: 'Invalid repo or issue number.', ephemeral: true });
    return;
  }

  const [owner, repo] = repoFull.split('/');

  await interaction.deferReply();

  try {
    const issue = await getIssue(owner, repo, issueNumber);
    const embed = buildGitHubIssueEmbed({
      owner,
      repo,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.url,
      type: issue.url.includes('/pull/') ? 'pull_request' : 'issue',
      labels: issue.labels,
      body: issue.body ?? undefined,
    });
    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply('Could not fetch that issue. Please check the repo and issue number.');
  }
}
