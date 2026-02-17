import { Config } from './core/Config.js';
import { StatsGenerator } from './core/StatsGenerator.js';
import { MESSAGES } from './constants/constants.js';
import { ConfigError } from './errors/errors.js';

/**
 * Main entry point for GitHub stats generation
 */
async function main() {
  console.log(MESSAGES.START);

  const config = Config.getInstance();
  const generator = new StatsGenerator(config);

  try {
    // Initialize and validate configuration
    generator.initialize();

    // Fetch GitHub data
    await generator.fetchData();

    // Generate SVG cards
    await generator.generateSVGs();

    // Generate README and HTML outputs
    await generator.generateOutputs();

    // Print summary
    generator.printSummary();
  } catch (error) {
    console.error(MESSAGES.ERROR_PREFIX);
    if (error instanceof ConfigError) {
      console.error(`${MESSAGES.CONFIG_ERROR} ${error.message}`);
      console.error(MESSAGES.CONFIG_ERROR_EXAMPLE);
    } else if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error('\n Stack trace:');
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the script
main();
