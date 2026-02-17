import type { LanguageStats, OctokitRepository } from '../types.js';
import { GitHubClient } from '../core/GitHubClient.js';

// Fallback colors if API fetch fails
const FALLBACK_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  C: '#555555',
  'C++': '#f34b7d',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Solidity: '#AA6746',
};

/**
 * Handles language statistics calculation
 */
export class LanguageService {
  #githubClient: GitHubClient;
  #cachedColors: Record<string, string> | null = null;

  constructor(githubClient: GitHubClient) {
    this.#githubClient = githubClient;
  }

  /**
   * Fetch language colors from GitHub's official colors JSON
   */
  async #fetchLanguageColors(): Promise<Record<string, string>> {
    if (this.#cachedColors) {
      return this.#cachedColors;
    }

    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json',
      );
      if (response.ok) {
        const colors = (await response.json()) as Record<
          string,
          { color: string | null }
        >;
        // Transform to our format: language name -> color hex
        const colorMap: Record<string, string> = {};
        for (const [lang, data] of Object.entries(colors)) {
          if (data.color) {
            colorMap[lang] = data.color;
          }
        }
        this.#cachedColors = colorMap;
        return colorMap;
      }
    } catch {
      // Fallback to local colors if fetch fails
      console.warn('  ⚠️  Failed to fetch language colors, using fallback');
    }

    // Return fallback colors
    this.#cachedColors = FALLBACK_LANGUAGE_COLORS;
    return FALLBACK_LANGUAGE_COLORS;
  }

  /**
   * Calculate language statistics from repositories
   */
  async calculateLanguageStats(
    repos: OctokitRepository[],
  ): Promise<LanguageStats[]> {
    // Fetch official language colors
    const languageColors = await this.#fetchLanguageColors();
    const languageBytes: Record<string, number> = {};

    console.log('  Fetching language breakdown for repositories...');
    let processedCount = 0;

    // Fetch actual language breakdown for each repository
    for (const repo of repos) {
      try {
        const languages = await this.#githubClient.fetchRepositoryLanguages(
          repo.owner.login,
          repo.name,
        );

        // Sum up bytes for each language across all repos
        for (const [lang, bytes] of Object.entries(languages)) {
          languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
        }

        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(
            `    Processed ${processedCount}/${repos.length} repositories...`,
          );
        }
      } catch (error) {
        // Skip repos we can't access (private repos without access, deleted repos, etc.)
        if (error instanceof Error && !error.message.includes('404')) {
          console.log(
            `    ⚠️  Could not fetch languages for ${repo.full_name}`,
          );
        }
      }
    }

    console.log(`    ✅ Processed ${processedCount} repositories`);

    const totalBytes = Object.values(languageBytes).reduce(
      (sum, bytes) => sum + bytes,
      0,
    );

    // Debug: Log all languages found
    const allLanguages = Object.entries(languageBytes)
      .map(([name, size]) => ({
        name,
        size,
        percentage: (size / totalBytes) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    console.log(`    📊 Languages found (${allLanguages.length} total):`);
    allLanguages.slice(0, 15).forEach(lang => {
      const linesEst = Math.round(lang.size / 70);
      const linesFormatted =
        linesEst >= 1000
          ? `${(linesEst / 1000).toFixed(0)}k`
          : linesEst.toString();
      console.log(
        `      - ${lang.name}: ${lang.percentage.toFixed(2)}% (~${linesFormatted} lines)`,
      );
    });

    const stats: LanguageStats[] = allLanguages.map(
      ({ name, size, percentage }) => ({
        name,
        color:
          languageColors[name] || FALLBACK_LANGUAGE_COLORS[name] || '#858585',
        percentage,
        size,
      }),
    );

    return stats;
  }
}
