import type { CommitData, OctokitRepository } from '../types.js';
import { GitHubClient } from '../core/GitHubClient.js';

/**
 * Service for fetching and processing commit data
 */
export class CommitService {
  #githubClient: GitHubClient;

  constructor(githubClient: GitHubClient) {
    this.#githubClient = githubClient;
  }

  /**
   * Fetch commits from all repositories
   */
  async fetchAllCommits(
    repos: OctokitRepository[],
    since: Date,
    until: Date,
  ): Promise<CommitData[]> {
    console.log('  📝 Fetching commits from repositories...');

    // Fetch commits from all repos in parallel (with limit to avoid rate limits)
    const commitPromises = repos.slice(0, 50).map(async repo => {
      try {
        return await this.#githubClient.fetchCommits(
          repo.owner.login,
          repo.name,
          since,
          until,
        );
      } catch {
        // Return empty array if fetch fails for a repo
        return [];
      }
    });

    const commitArrays = await Promise.all(commitPromises);
    const allCommits = commitArrays.flat();

    console.log(`  ✅ Fetched ${allCommits.length} commits`);
    return allCommits;
  }

  /**
   * Parse commit types from commit messages using Conventional Commits format
   */
  parseCommitTypes(commits: CommitData[]): Record<string, number> {
    const commitTypeRegex =
      /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert|merge)(\(.+\))?:/i;
    const types: Record<string, number> = {};

    commits.forEach(commit => {
      const match = commit.message.match(commitTypeRegex);
      const type = match ? match[1].toLowerCase() : 'other';
      types[type] = (types[type] || 0) + 1;
    });

    return types;
  }

  /**
   * Calculate hourly distribution of commits
   */
  calculateHourlyDistribution(commits: CommitData[]): number[] {
    const hours = new Array(24).fill(0);
    commits.forEach(commit => {
      hours[commit.hour]++;
    });
    return hours;
  }

  /**
   * Calculate repository activity over time
   */
  calculateRepoActivity(
    commits: CommitData[],
    days: number = 30,
  ): Array<{ name: string; commits: number; activityOverTime: number[] }> {
    const repoMap = new Map<
      string,
      { commits: number; dates: Map<string, number> }
    >();

    // Calculate date range
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    // Initialize date map for all days
    const dateMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    // Group commits by repository
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      if (commitDate >= startDate) {
        const dateStr = commitDate.toISOString().split('T')[0];
        if (!repoMap.has(commit.repository)) {
          repoMap.set(commit.repository, {
            commits: 0,
            dates: new Map(dateMap),
          });
        }
        const repo = repoMap.get(commit.repository);
        if (repo) {
          repo.commits++;
          repo.dates.set(dateStr, (repo.dates.get(dateStr) || 0) + 1);
        }
      }
    });

    // Convert to array and sort by commit count
    const repoActivity = Array.from(repoMap.entries())
      .map(([name, data]) => ({
        name,
        commits: data.commits,
        activityOverTime: Array.from(dateMap.keys()).map(
          date => data.dates.get(date) || 0,
        ),
      }))
      .filter(repo => repo.commits > 0) // Only repos with commits
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5); // Top 5 repos

    return repoActivity;
  }
}
