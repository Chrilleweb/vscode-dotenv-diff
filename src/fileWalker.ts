import * as fs from "fs";
import * as path from "path";

/**
 * Walks up the directory tree from a given file path
 * and returns the path to the nearest .env file found.
 *
 * Example: /apps/frontend/src/file.ts
 *   → checks /apps/frontend/src/.env
 *   → checks /apps/frontend/.env  ✓ found
 * @param filePath The file path to start searching from
 * @return The full path to the nearest .env file, or null if none found 
 */
export function findNearestEnv(filePath: string): string | null {
  let dir = path.dirname(filePath);

  // Walk up until we hit the filesystem root
  while (true) {
    const candidate = path.join(dir, ".env");

    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(dir);

    // We've reached the root, stop
    if (parent === dir) {
      return null;
    }

    dir = parent;
  }
}