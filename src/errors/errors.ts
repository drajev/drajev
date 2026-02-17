/**
 * Custom error classes for better error handling
 */

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Configuration-related errors
 */
export class ConfigError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * GitHub API-related errors
 */
export class GitHubAPIError extends AppError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}

/**
 * Generation-related errors (SVG, README, HTML)
 */
export class GenerationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Validation-related errors
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}
