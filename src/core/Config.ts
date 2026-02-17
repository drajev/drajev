import { DEFAULTS } from '../constants/constants.js';
import { PATHS } from '../constants/constants.js';
import { ERROR_MESSAGES } from '../constants/constants.js';
import { ConfigError } from '../errors/errors.js';

/**
 * Centralized configuration management
 */
export class Config {
  static #instance: Config;
  #githubToken: string;
  #githubUsername: string;
  #generatedDir: string;
  #readmePath: string;
  #indexPath: string;

  private constructor() {
    this.#githubToken = process.env.GITHUB_TOKEN || '';
    this.#githubUsername = process.env.GITHUB_USERNAME || DEFAULTS.USERNAME;
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

  get githubToken(): string {
    return this.#githubToken;
  }

  get githubUsername(): string {
    return this.#githubUsername;
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
    if (!this.#githubToken) {
      throw new ConfigError(ERROR_MESSAGES.NO_TOKEN, {
        username: this.#githubUsername,
      });
    }
  }
}
