import { parseEnvKeysFromText } from "./envParser";
import { scanForEnvUsages } from "./scanner";
import { isSourceFilePath } from "./sourceFileMatcher";

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
): string[] {
  const definedKeys = parseEnvKeysFromText(envText);
  const usedKeys = collectUsedEnvKeys(workspaceFiles);

  return Array.from(usedKeys)
    .filter((key) => !definedKeys.has(key))
    .sort((left, right) => left.localeCompare(right));
}

/**
 * Collects all unique environment variable keys used across source files.
 * @param workspaceFiles A map of absolute file paths to file text
 * @returns A set of all used environment variable keys
 */
function collectUsedEnvKeys(
  workspaceFiles: ReadonlyMap<string, string>,
): Set<string> {
  const usedKeys = new Set<string>();

  for (const [filePath, content] of workspaceFiles) {
    if (!isSourceFilePath(filePath)) {
      continue;
    }

    for (const usage of scanForEnvUsages(content)) {
      usedKeys.add(usage.key);
    }
  }

  return usedKeys;
}
