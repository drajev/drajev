import type {
  GitHubStats,
  UserContributions,
  OctokitRepository,
} from '../types.js';
import { GitHubClient } from './GitHubClient.js';
import { LanguageService } from '../services/LanguageService.js';
import { ContributionService } from '../services/ContributionService.js';
import { RepositoryService } from '../services/RepositoryService.js';
import { CommitService } from '../services/CommitService.js';
import { DATE_RANGES } from '../constants/constants.js';
import { MESSAGES } from '../constants/constants.js';

/**
 * Orchestrates data collection, caches results, provides computed stats
 */
export class StatsAggregator {
  #githubClient: GitHubClient;
  #languageService: LanguageService;
  #contributionService: ContributionService;
  #repositoryService: RepositoryService;
  #commitService: CommitService;

  // Cache
  #cachedRepos: OctokitRepository[] | null = null;
  #cachedContributions: UserContributions | null = null;
  #cachedUser: Awaited<ReturnType<GitHubClient['fetchUserInfo']>> | null = null;

  constructor(githubClient: GitHubClient) {
    this.#githubClient = githubClient;
    this.#languageService = new LanguageService(githubClient);
    this.#contributionService = new ContributionService(githubClient);
    this.#repositoryService = new RepositoryService(githubClient);
    this.#commitService = new CommitService(githubClient);
  }

  /**
   * Fetch all stats and aggregate them
   */
  async fetchAllStats(): Promise<GitHubStats> {
    console.log(MESSAGES.FETCHING_STATS);

    // Calculate date range for last 365 days
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - DATE_RANGES.CONTRIBUTION_DAYS);

    // Fetch core data in parallel
    const [userContributions, repos, user] = await Promise.all([
      this.#contributionService.fetchUserContributions(),
      this.#repositoryService.fetchRepositories(),
      this.#githubClient.fetchUserInfo(),
    ]);

    // Cache the results
    this.#cachedContributions = userContributions;
    this.#cachedRepos = repos;
    this.#cachedUser = user;

    // Process data in parallel
    const [languages, contributionGraph, streak, topRepos, commitData] =
      await Promise.all([
        this.#languageService.calculateLanguageStats(repos),
        this.#contributionService.parseContributionGraph(userContributions),
        this.#contributionService.calculateStreak(
          this.#contributionService.parseContributionGraph(userContributions),
        ),
        this.#repositoryService.getTopRepositories(repos),
        this.#commitService.fetchAllCommits(repos, oneYearAgo, today),
      ]);

    // Calculate additional stats
    const totalForks = repos.reduce(
      (sum, repo) => sum + (repo.forks_count ?? 0),
      0,
    );

    const totalActivity =
      userContributions.totalCommitContributions +
      userContributions.totalPullRequestContributions +
      userContributions.totalPullRequestReviewContributions +
      userContributions.totalIssueContributions;

    const contributionPercentages = {
      commits:
        totalActivity > 0
          ? Math.round(
              (userContributions.totalCommitContributions / totalActivity) *
                100,
            )
          : 0,
      prs:
        totalActivity > 0
          ? Math.round(
              (userContributions.totalPullRequestContributions /
                totalActivity) *
                100,
            )
          : 0,
      reviews:
        totalActivity > 0
          ? Math.round(
              (userContributions.totalPullRequestReviewContributions /
                totalActivity) *
                100,
            )
          : 0,
      issues:
        totalActivity > 0
          ? Math.round(
              (userContributions.totalIssueContributions / totalActivity) * 100,
            )
          : 0,
    };

    const avgCommitsPerDay =
      contributionGraph.length > 0
        ? Math.round(
            (userContributions.totalCommitContributions /
              contributionGraph.length) *
              10,
          ) / 10
        : 0;

    // Calculate productivity stats
    const productivityStats = {
      hourlyDistribution:
        this.#commitService.calculateHourlyDistribution(commitData),
      commitTypes: this.#commitService.parseCommitTypes(commitData),
    };

    // Calculate repository activity
    const repoActivity = this.#commitService.calculateRepoActivity(
      commitData,
      30,
    );

    return {
      username: this.#githubClient.user,
      userId: user.id,
      periodStart: oneYearAgo.toISOString().split('T')[0],
      periodEnd: today.toISOString().split('T')[0],
      totalCommits: userContributions.totalCommitContributions,
      totalPRs: userContributions.totalPullRequestContributions,
      totalIssues: userContributions.totalIssueContributions,
      totalReviews: userContributions.totalPullRequestReviewContributions,
      totalRepos: user.public_repos + (user.total_private_repos || 0),
      totalStars: repos.reduce(
        (sum, repo) => sum + (repo.stargazers_count ?? 0),
        0,
      ),
      totalForks,
      contributedTo: userContributions.totalRepositoriesWithContributedCommits,
      followers: user.followers,
      following: user.following,
      streak,
      languages,
      contributionGraph,
      topRepos,
      avgCommitsPerDay,
      contributionPercentages,
      commitData,
      productivityStats,
      repoActivity,
    };
  }

  /**
   * Get cached repositories
   */
  getCachedRepos(): OctokitRepository[] | null {
    return this.#cachedRepos;
  }

  /**
   * Get cached contributions
   */
  getCachedContributions(): UserContributions | null {
    return this.#cachedContributions;
  }

  /**
   * Get cached user info
   */
  getCachedUser(): Awaited<ReturnType<GitHubClient['fetchUserInfo']>> | null {
    return this.#cachedUser;
  }
}
