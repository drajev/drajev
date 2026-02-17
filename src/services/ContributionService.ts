import type {
  UserContributions,
  ContributionDay,
  StreakInfo,
  GraphQLContributionsResponse,
} from '../types.js';
import { GitHubClient } from '../core/GitHubClient.js';

/**
 * Handles contribution graph parsing and streak calculations
 */
export class ContributionService {
  #githubClient: GitHubClient;

  constructor(githubClient: GitHubClient) {
    this.#githubClient = githubClient;
  }

  /**
   * Fetch user contributions via GraphQL
   */
  async fetchUserContributions(): Promise<UserContributions> {
    console.log('  Fetching contributions (including private)...');

    // Calculate date range for last 365 days (matching GitHub's profile view)
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365); // Exactly 365 days ago

    // Format dates as ISO strings (GitHub expects YYYY-MM-DDTHH:MM:SSZ)
    const from = oneYearAgo.toISOString();
    const to = today.toISOString();

    console.log(
      `  📅 Querying contributions from ${from.split('T')[0]} to ${
        to.split('T')[0]
      }`,
    );

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalIssueContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            totalRepositoriesWithContributedCommits
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const result = (await this.#githubClient.graphql(query, {
      username: this.#githubClient.user,
      from,
      to,
    })) as GraphQLContributionsResponse;

    const contributions = result.user.contributionsCollection;

    // Debug: Log contribution breakdown
    console.log(
      `  📊 Contribution breakdown (${from.split('T')[0]} to ${
        to.split('T')[0]
      }):`,
    );
    console.log(`     - Commits: ${contributions.totalCommitContributions}`);
    console.log(`     - PRs: ${contributions.totalPullRequestContributions}`);
    console.log(
      `     - Reviews: ${contributions.totalPullRequestReviewContributions}`,
    );
    console.log(`     - Issues: ${contributions.totalIssueContributions}`);
    console.log(`     - Repos: ${contributions.totalRepositoryContributions}`);
    console.log(
      `     - Restricted: ${contributions.restrictedContributionsCount}`,
    );
    console.log(
      `     - Calendar Total: ${contributions.contributionCalendar.totalContributions}`,
    );

    return contributions;
  }

  /**
   * Parse contribution graph from UserContributions
   */
  parseContributionGraph(contributions: UserContributions): ContributionDay[] {
    const days: ContributionDay[] = [];

    for (const week of contributions.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        days.push({
          date: day.date,
          count: day.contributionCount,
          level: this.#getContributionLevel(day.contributionCount),
        });
      }
    }

    return days;
  }

  /**
   * Get contribution level from count
   */
  #getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 9) return 3;
    return 4;
  }

  /**
   * Calculate streak information
   */
  calculateStreak(contributions: ContributionDay[]): StreakInfo {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort by date descending
    const sortedContributions = [...contributions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Calculate current streak
    let streakActive = true;
    for (const day of sortedContributions) {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      if (streakActive && day.count > 0) {
        currentStreak++;
      } else if (streakActive && day.count === 0) {
        const diffDays = Math.floor(
          (today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 1) {
          streakActive = false;
        }
      }
    }

    // Calculate longest streak
    for (const day of contributions) {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const totalContributions = contributions.reduce(
      (sum, day) => sum + day.count,
      0,
    );

    return {
      currentStreak,
      longestStreak,
      totalContributions,
    };
  }
}
