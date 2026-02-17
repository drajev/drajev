import type {
  GitHubStats,
  ContributionDay,
  LanguageStats,
  RepoInfo,
  RepoActivity,
} from '../types.js';
import { Config } from './Config.js';
import { GitHubClient } from './GitHubClient.js';
import { StatsAggregator } from './StatsAggregator.js';
import { StatsOverviewGenerator } from '../generators/StatsOverviewGenerator.js';
import { LanguagesGenerator } from '../generators/LanguagesGenerator.js';
import { ProductivitySemanticsGenerator } from '../generators/ProductivitySemanticsGenerator.js';
import { FileUtils } from '../utils/FileUtils.js';
import { generateHeader } from '../templates/readme/header.js';
import { generateConnect } from '../templates/readme/connect.js';
import { generateStatsSection } from '../templates/readme/stats.js';
import { generateLanguagesAndTools } from '../templates/readme/languages-tools.js';
import { generateIndexHTML } from '../templates/html/html.js';
import { MESSAGES } from '../constants/constants.js';
import { PATHS } from '../constants/constants.js';
import { ConfigError } from '../errors/errors.js';
import { GenerationError } from '../errors/errors.js';

/**
 * Orchestrates the entire GitHub stats generation process
 */
export class StatsGenerator {
  #config: Config;
  #stats: GitHubStats | null = null;

  constructor(config: Config) {
    this.#config = config;
  }

  /**
   * Initialize and validate configuration
   */
  initialize(): void {
    try {
      this.#config.validate();
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError(
        error instanceof Error ? error.message : 'Unknown configuration error',
      );
    }
  }

  /**
   * Fetch GitHub data from all configured tokens and merge results
   */
  async fetchData(): Promise<GitHubStats> {
    console.log(MESSAGES.FETCHING_DATA);

    const tokens = this.#config.githubTokens;
    const usernames = this.#config.githubUsername;
    const allStats: GitHubStats[] = [];

    for (let i = 0; i < usernames.length; i++) {
      const token = tokens[i % tokens.length];
      console.log(
        `  Fetching data for ${usernames[i]} (${i + 1} of ${usernames.length})...`,
      );
      const client = new GitHubClient(token, usernames[i]);
      const aggregator = new StatsAggregator(client);
      allStats.push(await aggregator.fetchAllStats());
    }

    this.#stats =
      allStats.length === 1 ? allStats[0] : this.#mergeStats(allStats);

    console.log(MESSAGES.DATA_FETCHED);
    return this.#stats;
  }

  /**
   * Merge stats from multiple GitHub accounts into one combined result
   */
  #mergeStats(statsArray: GitHubStats[]): GitHubStats {
    const first = statsArray[0];

    // Merge contribution graphs by date (sum counts, take max level)
    const contributionMap = new Map<
      string,
      { count: number; level: 0 | 1 | 2 | 3 | 4 }
    >();
    for (const stats of statsArray) {
      for (const day of stats.contributionGraph) {
        const existing = contributionMap.get(day.date);
        if (existing) {
          existing.count += day.count;
          existing.level = Math.max(existing.level, day.level) as
            | 0
            | 1
            | 2
            | 3
            | 4;
        } else {
          contributionMap.set(day.date, { count: day.count, level: day.level });
        }
      }
    }
    const contributionGraph: ContributionDay[] = Array.from(
      contributionMap.entries(),
    )
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, data]) => ({ date, ...data }));

    // Calculate streak from merged contribution graph
    const streak = this.#calculateStreak(contributionGraph);

    // Merge languages by name (sum sizes, recalculate percentages)
    const langMap = new Map<string, { color: string; size: number }>();
    for (const stats of statsArray) {
      for (const lang of stats.languages) {
        const existing = langMap.get(lang.name);
        if (existing) {
          existing.size += lang.size;
        } else {
          langMap.set(lang.name, { color: lang.color, size: lang.size });
        }
      }
    }
    const totalLangSize = Array.from(langMap.values()).reduce(
      (sum, l) => sum + l.size,
      0,
    );
    const languages: LanguageStats[] = Array.from(langMap.entries())
      .map(([name, data]) => ({
        name,
        color: data.color,
        size: data.size,
        percentage: totalLangSize > 0 ? (data.size / totalLangSize) * 100 : 0,
      }))
      .sort((a, b) => b.size - a.size);

    // Merge top repos: combine all, sort by stars, take top 5
    const repoMap = new Map<string, RepoInfo>();
    for (const stats of statsArray) {
      for (const repo of stats.topRepos) {
        const existing = repoMap.get(repo.name);
        if (!existing || repo.stars > existing.stars) {
          repoMap.set(repo.name, repo);
        }
      }
    }
    const topRepos: RepoInfo[] = Array.from(repoMap.values())
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5);

    // Merge commit data: concatenate and sort by date
    const commitData = statsArray
      .flatMap(s => s.commitData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Merge productivity stats
    const hourlyDistribution = new Array(24).fill(0);
    const commitTypes: Record<string, number> = {};
    for (const stats of statsArray) {
      for (let h = 0; h < 24; h++) {
        hourlyDistribution[h] +=
          stats.productivityStats.hourlyDistribution[h] || 0;
      }
      for (const [type, count] of Object.entries(
        stats.productivityStats.commitTypes,
      )) {
        commitTypes[type] = (commitTypes[type] || 0) + count;
      }
    }

    // Merge repo activity: combine by name
    const activityMap = new Map<
      string,
      { commits: number; activityOverTime: number[] }
    >();
    for (const stats of statsArray) {
      for (const activity of stats.repoActivity) {
        const existing = activityMap.get(activity.name);
        if (existing) {
          existing.commits += activity.commits;
          for (let i = 0; i < activity.activityOverTime.length; i++) {
            existing.activityOverTime[i] =
              (existing.activityOverTime[i] || 0) +
              activity.activityOverTime[i];
          }
        } else {
          activityMap.set(activity.name, {
            commits: activity.commits,
            activityOverTime: [...activity.activityOverTime],
          });
        }
      }
    }
    const repoActivity: RepoActivity[] = Array.from(activityMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5);

    // Sum numeric fields
    const totalCommits = statsArray.reduce((sum, s) => sum + s.totalCommits, 0);
    const totalPRs = statsArray.reduce((sum, s) => sum + s.totalPRs, 0);
    const totalIssues = statsArray.reduce((sum, s) => sum + s.totalIssues, 0);
    const totalReviews = statsArray.reduce((sum, s) => sum + s.totalReviews, 0);
    const totalActivity = totalCommits + totalPRs + totalIssues + totalReviews;

    // Calculate avg commits per day from merged contribution graph
    const daysWithContributions = contributionGraph.filter(
      d => d.count > 0,
    ).length;
    const avgCommitsPerDay =
      daysWithContributions > 0
        ? Math.round((totalCommits / daysWithContributions) * 100) / 100
        : 0;

    return {
      username: first.username,
      userId: first.userId,
      periodStart: first.periodStart,
      periodEnd: first.periodEnd,
      totalCommits,
      totalPRs,
      totalIssues,
      totalReviews,
      totalRepos: statsArray.reduce((sum, s) => sum + s.totalRepos, 0),
      totalStars: statsArray.reduce((sum, s) => sum + s.totalStars, 0),
      totalForks: statsArray.reduce((sum, s) => sum + s.totalForks, 0),
      contributedTo: statsArray.reduce((sum, s) => sum + s.contributedTo, 0),
      followers: first.followers,
      following: first.following,
      streak,
      languages,
      contributionGraph,
      topRepos,
      avgCommitsPerDay,
      contributionPercentages: {
        commits:
          totalActivity > 0
            ? Math.round((totalCommits / totalActivity) * 10000) / 100
            : 0,
        prs:
          totalActivity > 0
            ? Math.round((totalPRs / totalActivity) * 10000) / 100
            : 0,
        reviews:
          totalActivity > 0
            ? Math.round((totalReviews / totalActivity) * 10000) / 100
            : 0,
        issues:
          totalActivity > 0
            ? Math.round((totalIssues / totalActivity) * 10000) / 100
            : 0,
      },
      commitData,
      productivityStats: { hourlyDistribution, commitTypes },
      repoActivity,
    };
  }

  /**
   * Calculate streak info from a contribution graph
   */
  #calculateStreak(contributions: ContributionDay[]) {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDesc = [...contributions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streakActive = true;
    for (const day of sortedDesc) {
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

    return { currentStreak, longestStreak, totalContributions };
  }

  /**
   * Generate SVG cards
   */
  async generateSVGs(): Promise<void> {
    if (!this.#stats) {
      throw new GenerationError('Stats must be fetched before generating SVGs');
    }

    console.log(MESSAGES.GENERATING_SVG);

    // Ensure generated directory exists
    await FileUtils.ensureDirectory(this.#config.generatedDir);

    // Generate SVG cards using generators
    const statsOverviewGenerator = new StatsOverviewGenerator(this.#stats);
    const languagesGenerator = new LanguagesGenerator(this.#stats);
    const productivitySemanticsGenerator = new ProductivitySemanticsGenerator(
      this.#stats,
    );

    const statsOverview = statsOverviewGenerator.generate();
    const languagesCard = languagesGenerator.generate();
    const productivitySemanticsCard = productivitySemanticsGenerator.generate();

    // Write SVG files
    await FileUtils.writeFile(
      FileUtils.join(this.#config.generatedDir, PATHS.SVG.STATS_OVERVIEW),
      statsOverview,
    );
    await FileUtils.writeFile(
      FileUtils.join(this.#config.generatedDir, PATHS.SVG.LANGUAGES),
      languagesCard,
    );
    await FileUtils.writeFile(
      FileUtils.join(this.#config.generatedDir, PATHS.SVG.PRODUCTIVITY),
      productivitySemanticsCard,
    );

    console.log(MESSAGES.SVG_STATS_OVERVIEW);
    console.log(MESSAGES.SVG_LANGUAGES);
    console.log('  ✓ Generated productivity.svg');
    console.log(MESSAGES.SVG_GENERATED);
  }

  /**
   * Generate README and HTML outputs
   */
  async generateOutputs(): Promise<void> {
    if (!this.#stats) {
      throw new GenerationError(
        'Stats must be fetched before generating outputs',
      );
    }

    // Generate README.md
    console.log(MESSAGES.GENERATING_README);
    const readmeContent = `${generateHeader()}

${generateConnect()}

${generateStatsSection()}

${generateLanguagesAndTools()}
`;
    await FileUtils.writeFile(this.#config.readmePath, readmeContent);
    console.log(MESSAGES.README_GENERATED);

    // Generate index.html
    console.log(MESSAGES.GENERATING_HTML);
    const indexHTML = generateIndexHTML(this.#stats);
    await FileUtils.writeFile(this.#config.indexPath, indexHTML);
    console.log(MESSAGES.HTML_GENERATED);
  }

  /**
   * Print summary statistics
   */
  printSummary(): void {
    if (!this.#stats) {
      throw new GenerationError(
        'Stats must be fetched before printing summary',
      );
    }

    console.log(MESSAGES.COMPLETED);
    console.log(MESSAGES.SUMMARY_TITLE);
    console.log(
      `   • Total Contributions: ${this.#stats.streak.totalContributions.toLocaleString()}`,
    );
    console.log(
      `   • Total Commits: ${this.#stats.totalCommits.toLocaleString()}`,
    );
    console.log(`   • Total PRs: ${this.#stats.totalPRs.toLocaleString()}`);
    console.log(
      `   • Total Reviews: ${this.#stats.totalReviews.toLocaleString()}`,
    );
    console.log(
      `   • Total Issues: ${this.#stats.totalIssues.toLocaleString()}`,
    );
    console.log(`   • Total Repos: ${this.#stats.totalRepos}`);
    console.log(`   • Total Stars: ${this.#stats.totalStars.toLocaleString()}`);
    console.log(`   • Total Forks: ${this.#stats.totalForks.toLocaleString()}`);
    console.log(`   • Followers: ${this.#stats.followers.toLocaleString()}`);
    console.log(
      `   • Current Streak: ${this.#stats.streak.currentStreak} days`,
    );
    console.log(`   • Avg Commits/Day: ${this.#stats.avgCommitsPerDay}`);
    console.log(
      `   • Top Language: ${this.#stats.languages[0]?.name || 'N/A'
      } (${this.#stats.languages[0]?.percentage.toFixed(1)}%)`,
    );
    console.log(MESSAGES.STATS_UPDATED);
  }

  /**
   * Get the fetched stats (for external access if needed)
   */
  getStats(): GitHubStats | null {
    return this.#stats;
  }
}
