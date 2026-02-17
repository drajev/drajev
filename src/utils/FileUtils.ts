import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * File system utility functions
 */
export class FileUtils {
  /**
   * Ensure directory exists
   */
  static async ensureDirectory(dirPath: string): Promise<void> {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Write file with UTF-8 encoding
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content, 'utf-8');
  }

  /**
   * Join path segments
   */
  static join(...paths: string[]): string {
    return join(...paths);
  }

  /**
   * Check if file exists
   */
  static exists(filePath: string): boolean {
    return existsSync(filePath);
  }
}
