import { isInComment } from "./commentDetector";
import {
  PROCESS_ENV_PATTERN,
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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collectSvelteKitStaticBindings(sourceText: string): SvelteKitStaticBinding[] {
  const bindings: SvelteKitStaticBinding[] = [];
  let match: RegExpExecArray | null;

  while ((match = SVELTEKIT_STATIC_ENV_IMPORT_PATTERN.exec(sourceText)) !== null) {
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

function scanSvelteKitStaticUsages(
  sourceText: string,
  bindings: SvelteKitStaticBinding[],
): EnvUsage[] {
  const usages: EnvUsage[] = [];

  for (const binding of bindings) {
    const identifierPattern = new RegExp(`\\b${escapeRegExp(binding.localName)}\\b`, "g");
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

  return usages;
}
