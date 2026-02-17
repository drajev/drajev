import { DEFAULTS } from '../constants/constants.js';
import { PATHS } from '../constants/constants.js';
import { ERROR_MESSAGES } from '../constants/constants.js';
import { ConfigError } from '../errors/errors.js';

/**
 * Centralized configuration management
 */
export class Config {
  static #instance: Config;
  #githubTokens: string;
  #githubUsername: string;
  #generatedDir: string;
  #readmePath: string;
  #indexPath: string;

  private constructor() {
    this.#githubTokens = process.env.GH_STATS_TOKENS || '';
    this.#githubUsername = process.env.GH_USERNAME || DEFAULTS.USERNAME;
    this.#generatedDir = PATHS.GENERATED_DIR;
    this.#readmePath = PATHS.README;
    this.#indexPath = PATHS.INDEX_HTML;
  }

  static getInstance(): Config {
    if (!Config.#instance) {
      Config.#instance = new Config();
    }
    return Config.#instance;
  }

  get githubTokens(): string[] {
    return this.#githubTokens.split(',');
  }

  get githubUsername(): string[] {
    return this.#githubUsername.split(',').map((username) => username.trim());
  }

  get generatedDir(): string {
    return this.#generatedDir;
  }

  get readmePath(): string {
    return this.#readmePath;
  }

  get indexPath(): string {
    return this.#indexPath;
  }

  validate(): void {
    if (!this.#githubTokens) {
      throw new ConfigError(ERROR_MESSAGES.NO_TOKEN, {
        username: this.#githubUsername,
      });
    }
  }
}
