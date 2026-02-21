/**
 * Scans source code text for all process.env.KEY references.
 * Returns an array of matches with the key name and its position.
 *
 * Handles:
 *   process.env.MY_KEY
 *   process.env["MY_KEY"]
 *   process.env['MY_KEY']
 */

/**
 * Represents a single usage of an environment variable in the source code.
 */
export interface EnvUsage {
  /** The name of the environment variable being accessed (e.g., "MY_KEY") */
  key: string;
  /** The character index in the source text where this usage starts */
  index: number;
}

// Matches: process.env.KEY or process.env["KEY"] or process.env['KEY']
const ENV_PATTERN =
  /process\.env\.([A-Z_][A-Z0-9_]*)|process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]]/g;

  /**
 * Scans the given source code text for all occurrences of process.env.KEY
 * and returns an array of EnvUsage objects with the key name and position.
 * @param sourceText The full text of the source code to scan
 * @return An array of EnvUsage objects representing each environment variable usage found 
 */
export function scanForEnvUsages(sourceText: string): EnvUsage[] {
  const usages: EnvUsage[] = [];
  let match: RegExpExecArray | null;

  while ((match = ENV_PATTERN.exec(sourceText)) !== null) {
    // Group 1 = dot notation, group 2 = bracket notation
    const key = match[1] ?? match[2];
    usages.push({ key, index: match.index });
  }

  // Reset regex state (important for global regex reuse)
  ENV_PATTERN.lastIndex = 0;

  return usages;
}
