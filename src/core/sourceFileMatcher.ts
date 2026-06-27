import { SOURCE_FILE_EXTENSIONS } from "./constants";

/**
 * Directory segments whose contents are never the user's own source code.
 * Files inside these (e.g. dependency or build output) leak unrelated
 * process.env.* references such as DOTENV_CONFIG_QUIET (from `dotenv`) or
 * SC_ATTR (from `styled-components`) and must not be scanned.
 */
const EXCLUDED_PATH_SEGMENTS = ["node_modules", "dist", "build", "out", ".next"];

/**
 * Helper function to determine if a file path points to a supported source file.
 * Only files with .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts, or .svelte extensions are considered source files.
 * Files that include .test. or .spec. in their name are excluded to avoid scanning test files.
 * Files inside dependency or build-output directories (e.g. node_modules) are also excluded.
 * @param filePath The file path to check
 * @returns True if the file path points to a source file, false otherwise
 */
export function isSourceFilePath(filePath: string): boolean {
  if (isInExcludedDirectory(filePath)) {
    return false;
  }

  return (
    new RegExp(`\\.(${SOURCE_FILE_EXTENSIONS})$`).test(filePath) &&
    !new RegExp(`\\.(test|spec)\\.(${SOURCE_FILE_EXTENSIONS})$`).test(filePath)
  );
}

/**
 * Returns true when the path contains a directory segment that should never be
 * scanned (e.g. node_modules or build output). Handles both / and \ separators.
 * @param filePath The file path to check
 * @returns True if any path segment is an excluded directory
 */
export function isInExcludedDirectory(filePath: string): boolean {
  const segments = filePath.split(/[/\\]/);
  return segments.some((segment) => EXCLUDED_PATH_SEGMENTS.includes(segment));
}