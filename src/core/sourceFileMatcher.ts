/**
 * Checks if a given file path is a source file that should be analyzed for environment variable usage.
 * This includes .ts, .js, .mjs, .cjs, .mts, and .cts files, but excludes test/spec files.
 * @param filePath The file path to check
 * @returns True if the file path points to a source file, false otherwise
 */
export function isSourceFilePath(filePath: string): boolean {
  return (
    /\.(ts|js|mjs|cjs|mts|cts)$/.test(filePath) &&
    !filePath.endsWith(".test.ts") &&
    !filePath.endsWith(".test.js") &&
    !filePath.endsWith(".spec.ts") &&
    !filePath.endsWith(".spec.js")
  );
}