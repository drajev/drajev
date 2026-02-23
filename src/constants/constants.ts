/**
 * Application-wide constants
 */

/**
 * Date range constants
 */
export const DATE_RANGES = {
  /** Number of days to look back for contributions */
  CONTRIBUTION_DAYS: 365,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  /** Default branch name */
  BRANCH: 'main',
  /** Default GitHub username */
  USERNAME: 'AlexanderDrazhev',
} as const;

/**
 * File paths and names
 */
export const PATHS = {
  /** Generated files directory */
  GENERATED_DIR: 'generated',
  /** README file path */
  README: 'README.md',
  /** Index HTML file path */
  INDEX_HTML: 'index.html',
  /** SVG file names */
  SVG: {
    STATS_OVERVIEW: 'stats-overview.svg',
    LANGUAGES: 'languages.svg',
    PRODUCTIVITY: 'productivity.svg',
  },
} as const;

/**
 * Console messages
 */
export const MESSAGES = {
  START: '🚀 Starting GitHub Stats Factory...\n',
  FETCHING_DATA: '📡 Step 1: Fetching GitHub data...',
  DATA_FETCHED: '✅ Data fetched successfully\n',
  GENERATING_SVG: '🎨 Step 2: Generating SVG cards...',
  SVG_GENERATED: '✅ SVG cards generated\n',
  GENERATING_README: '📝 Step 3: Generating README.md...',
  README_GENERATED: '✅ README.md generated\n',
  GENERATING_HTML: '🌐 Step 4: Generating index.html...',
  HTML_GENERATED: '✅ index.html generated\n',
  COMPLETED: '🎉 GitHub Stats Factory completed successfully!\n',
  SUMMARY_TITLE: '📊 Summary:',
  STATS_UPDATED: '\n✨ Your stats are now up to date!',
  ERROR_PREFIX: '\n❌ Error generating stats:',
  CONFIG_ERROR: '❌ Error:',
  CONFIG_ERROR_EXAMPLE: '   Example: GITHUB_TOKEN=ghp_xxxxxxxxxxxx',
  FETCHING_STATS: '📊 Fetching GitHub stats...',
  SVG_STATS_OVERVIEW: '  ✓ Generated stats-overview.svg',
  SVG_LANGUAGES: '  ✓ Generated languages.svg',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_TOKEN:
    'GITHUB_TOKEN is not set in environment variables. Please create a .env file with your GitHub Personal Access Token.',
} as const;
