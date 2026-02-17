/**
 * Type guard functions for runtime type checking
 */

/**
 * Type guard to check if a value is a non-null object
 */
export function isNonNullObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if a value is a valid date string (YYYY-MM-DD)
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(
  obj: unknown,
  prop: K,
): obj is Record<K, unknown> {
  return isNonNullObject(obj) && prop in obj;
}
