import * as path from "path";
import { parseEnvKeysFromText } from "./envParser";
import { scanForEnvUsages } from "./scanner";
import { isSourceFilePath } from "./sourceFileMatcher";
import { DEFAULT_EXCLUDE_KEY_SET } from "./constants";
import { findNearestEnv } from "./fileWalker";

/**
 * Returns environment variable keys that are used in source files but not defined
 * in the currently edited .env content.
 *
 * The result is sorted alphabetically and contains unique keys only.
 * @param envText The full text content of the current .env document
 * @param workspaceFiles A map of absolute file paths to their current text content
 * @returns Sorted missing environment variable keys
 */
export function getMissingEnvKeysForEnvText(
  envText: string,
  workspaceFiles: ReadonlyMap<string, string>,
  envFilePath?: string,
): string[] {
  const definedKeys = parseEnvKeysFromText(envText);
  const usedKeys = collectUsedEnvKeys(workspaceFiles, envFilePath);

  return Array.from(usedKeys)
    .filter((key) => !definedKeys.has(key) && !DEFAULT_EXCLUDE_KEY_SET.has(key))
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Collects all unique environment variable keys used across source files.
 * @param workspaceFiles A map of absolute file paths to file text
 * @returns A set of all used environment variable keys
 */
function collectUsedEnvKeys(
  workspaceFiles: ReadonlyMap<string, string>,
  envFilePath?: string,
): Set<string> {
  const usedKeys = new Set<string>();

  const normalizedTargetEnvPath = envFilePath
    ? normalizePathForComparison(envFilePath)
    : undefined;

  for (const [filePath, content] of workspaceFiles) {
    if (!isSourceFilePath(filePath)) {
      continue;
    }

    if (normalizedTargetEnvPath) {
      const nearestEnvForSource = findNearestEnv(filePath);
      if (!nearestEnvForSource) {
        continue;
      }

      const normalizedNearestEnvPath = normalizePathForComparison(nearestEnvForSource);
      if (normalizedNearestEnvPath !== normalizedTargetEnvPath) {
        continue;
      }
    }

    for (const usage of scanForEnvUsages(content)) {
      if (!DEFAULT_EXCLUDE_KEY_SET.has(usage.key)) {
        usedKeys.add(usage.key);
      }
    }
  }

  return usedKeys;
}

/**
 * Normalizes file paths for stable path equality checks across platforms.
 * @param filePath Path to normalize
 * @returns Normalized absolute-like path representation
 */
function normalizePathForComparison(filePath: string): string {
  const normalized = path.normalize(filePath);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}
