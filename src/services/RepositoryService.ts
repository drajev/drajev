import type { OctokitRepository, RepoInfo } from '../types.js';
import { GitHubClient } from '../core/GitHubClient.js';

/**
 * Handles repository data fetching and filtering
 */
export class RepositoryService {
  #githubClient: GitHubClient;

  constructor(githubClient: GitHubClient) {
    this.#githubClient = githubClient;
  }

  /**
   * Fetch all repositories
   */
  async fetchRepositories(): Promise<OctokitRepository[]> {
    console.log('  Fetching repositories...');
    const repos = await this.#githubClient.fetchRepositories();
    console.log(`    ✅ Found ${repos.length} repositories`);
    return repos;
  }

  /**
   * Get top repositories by stars
   */
  getTopRepositories(repos: OctokitRepository[]): RepoInfo[] {
    return repos
      .filter(repo => !repo.fork)
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        description: repo.description ?? '',
        language: repo.language ?? 'Unknown',
      }));
  }
}
