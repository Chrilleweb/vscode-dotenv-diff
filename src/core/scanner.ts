import { isInComment } from "./commentDetector";
import {
  PROCESS_ENV_PATTERN,
  PROCESS_ENV_DESTRUCTURING_PATTERN,
  IMPORT_META_ENV_PATTERN,
  SVELTEKIT_ENV_IMPORT_PATTERN,
  SVELTEKIT_ENV_PATTERN,
  SVELTEKIT_STATIC_ENV_IMPORT_PATTERN,
} from "./constants";

/**
 * Represents a single usage of an environment variable in the source code.
 */
interface EnvUsage {
  /** The name of the environment variable being accessed (e.g., "MY_KEY") */
  key: string;
  /** The character index in the source text where this usage starts */
  index: number;
  /** The full matched token length (e.g., process.env.KEY) */
  matchLength: number;
}

interface SvelteKitStaticBinding {
  /** The original environment variable key (e.g., "MY_KEY") */
  key: string;
  /** The local name used in the import statement (e.g., "MY_KEY" or "ALIAS") */
  localName: string;
  /** The character index in the source text where the import starts */
  importStart: number;
  /** The character index in the source text where the import ends */
  importEnd: number;
}

/**
 * Scans the given source code text for all occurrences of environment variable usages.
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

      usages.push({ key, index: match.index, matchLength: match[0].length });
    }

    pattern.lastIndex = 0;
  }

  const staticBindings = collectSvelteKitStaticBindings(sourceText);
  if (staticBindings.length > 0) {
    usages.push(...scanSvelteKitStaticUsages(sourceText, staticBindings));
  }

  usages.push(...scanProcessEnvDestructuringUsages(sourceText));

  return usages;
}

/**
 * Escapes special RegExp characters in a string so it can be matched literally.
 * @param text The raw text that should be escaped for use in a RegExp
 * @return A RegExp-safe string where special characters are escaped
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Collects static SvelteKit $env imports and maps each imported binding.
 * @param sourceText The full source code text to scan
 * @return A list of key/localName bindings with import source ranges
 */
function collectSvelteKitStaticBindings(
  sourceText: string,
): SvelteKitStaticBinding[] {
  const bindings: SvelteKitStaticBinding[] = [];
  let match: RegExpExecArray | null;

  while (
    (match = SVELTEKIT_STATIC_ENV_IMPORT_PATTERN.exec(sourceText)) !== null
  ) {
    const importSpec = match[1] ?? "";
    const importStart = match.index;
    const importEnd = match.index + match[0].length;

    for (const rawBinding of importSpec.split(",")) {
      const binding = rawBinding.trim();
      if (!binding) {
        continue;
      }

      const parsed = /^([A-Z_][A-Z0-9_]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(
        binding,
      );
      if (!parsed) {
        continue;
      }

      const key = parsed[1];
      const localName = parsed[2] ?? key;
      bindings.push({ key, localName, importStart, importEnd });
    }
  }

  SVELTEKIT_STATIC_ENV_IMPORT_PATTERN.lastIndex = 0;
  return bindings;
}

/**
 * Scans usages of previously collected SvelteKit static import bindings.
 * Excludes matches inside the import declaration and inside comments.
 * @param sourceText The full source code text to scan
 * @param bindings The collected SvelteKit static bindings to resolve usages for
 * @return A list of resolved environment variable usages
 */
function scanSvelteKitStaticUsages(
  sourceText: string,
  bindings: SvelteKitStaticBinding[],
): EnvUsage[] {
  const usages: EnvUsage[] = [];

  for (const binding of bindings) {
    const identifierPattern = new RegExp(
      `\\b${escapeRegExp(binding.localName)}\\b`,
      "g",
    );
    let match: RegExpExecArray | null;

    while ((match = identifierPattern.exec(sourceText)) !== null) {
      const index = match.index;
      const isInImportDeclaration =
        index >= binding.importStart && index < binding.importEnd;

      if (isInImportDeclaration || isInComment(sourceText, index)) {
        continue;
      }

      usages.push({ key: binding.key, index, matchLength: match[0].length });
    }
  }

  return usages;
}

/**
 * Scans object destructuring assignments from process.env and extracts env keys.
 * Supports direct keys, aliases, and default values.
 * @param sourceText The full source code text to scan
 * @return A list of environment variable usages found in destructuring patterns
 */
function scanProcessEnvDestructuringUsages(sourceText: string): EnvUsage[] {
  const usages: EnvUsage[] = [];
  let match: RegExpExecArray | null;

  while (
    (match = PROCESS_ENV_DESTRUCTURING_PATTERN.exec(sourceText)) !== null
  ) {
    const objectPattern = match[1] ?? "";
    const objectStartInMatch = match[0].indexOf("{") + 1;
    const objectStartInSource = match.index + objectStartInMatch;
    const keyPattern = /(?<!\.)\b([A-Z_][A-Z0-9_]*)\b(?=\s*(?::|=|,|$))/g;
    let keyMatch: RegExpExecArray | null;

    while ((keyMatch = keyPattern.exec(objectPattern)) !== null) {
      const key = keyMatch[1];
      const index = objectStartInSource + keyMatch.index;

      if (isInComment(sourceText, index)) {
        continue;
      }

      usages.push({ key, index, matchLength: key.length });
    }
  }

  PROCESS_ENV_DESTRUCTURING_PATTERN.lastIndex = 0;
  return usages;
}
