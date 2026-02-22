import { isInComment } from "./commentDetector";
import {
  PROCESS_ENV_PATTERN,
  IMPORT_META_ENV_PATTERN,
  SVELTEKIT_ENV_IMPORT_PATTERN,
  SVELTEKIT_ENV_PATTERN,
} from "./constants";

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

/**
 * Scans the given source code text for all occurrences of process.env.KEY
 * This will also ignore comments (both single-line and block comments) to avoid false positives.
 * @param sourceText The full text of the source code to scan
 * @return An array of EnvUsage objects representing each environment variable usage found
 */
export function scanForEnvUsages(sourceText: string): EnvUsage[] {
  const usages: EnvUsage[] = [];

  // Build patterns array fresh on each call
  const patterns = [PROCESS_ENV_PATTERN, IMPORT_META_ENV_PATTERN];

  // Only scan for env.KEY if file imports from SvelteKit's $env module
  if (SVELTEKIT_ENV_IMPORT_PATTERN.test(sourceText)) {
    patterns.push(SVELTEKIT_ENV_PATTERN);
  }

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(sourceText)) !== null) {
      const key = match[1] ?? match[2];

      if (isInComment(sourceText, match.index)) {
        continue;
      }

      usages.push({ key, index: match.index });
    }

    pattern.lastIndex = 0;
  }

  return usages;
}
