import { SOURCE_FILE_EXTENSIONS } from "./constants";
/**
 * Helper function to determine if a file path points to a TypeScript or JavaScript source file.
 * Only files with .ts, .js, .mjs, .cjs, .mts, or .cts extensions are considered source files.
 * Files that include .test. or .spec. in their name are excluded to avoid scanning test files.
 * @param filePath The file path to check
 * @returns True if the file path points to a source file, false otherwise
 */
export function isSourceFilePath(filePath: string): boolean {
  return (
    new RegExp(`\\.(${SOURCE_FILE_EXTENSIONS})$`).test(filePath) &&
    !new RegExp(`\\.(test|spec)\\.(${SOURCE_FILE_EXTENSIONS})$`).test(filePath)
  );
}