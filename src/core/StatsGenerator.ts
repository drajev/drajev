import type { GitHubStats } from '../types.js';
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
  #githubClient: GitHubClient | null = null;
  #statsAggregator: StatsAggregator | null = null;
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
   * Fetch GitHub data
   */
  async fetchData(): Promise<GitHubStats> {
    console.log(MESSAGES.FETCHING_DATA);

    this.#githubClient = new GitHubClient(
      this.#config.githubToken,
      this.#config.githubUsername,
    );
    this.#statsAggregator = new StatsAggregator(this.#githubClient);
    this.#stats = await this.#statsAggregator.fetchAllStats();

    console.log(MESSAGES.DATA_FETCHED);
    return this.#stats;
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
      `   • Top Language: ${
        this.#stats.languages[0]?.name || 'N/A'
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
