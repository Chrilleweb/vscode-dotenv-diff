/**
 * The name of the environment file to look for.
 * Used when walking up the directory tree and in diagnostic messages.
 */
export const ENV_FILE_NAME = ".env";

/**
 * Glob pattern for finding source files in the workspace.
 * Used by vscode.workspace.findFiles() on startup.
 */
export const SOURCE_FILE_GLOB = "**/*.{ts,js,mjs,cjs,mts,cts}";

/**
 * Glob pattern for excluding files from workspace scanning.
 * Excludes node_modules and test/spec files.
 */
export const EXCLUDE_FILE_GLOB =
  "{**/node_modules/**,**/*.test.ts,**/*.test.js,**/*.test.mjs,**/*.test.cjs,**/*.test.mts,**/*.test.cts,**/*.spec.ts,**/*.spec.js,**/*.spec.mjs,**/*.spec.cjs,**/*.spec.mts,**/*.spec.cts}";

/**
 * Matches process.env.KEY references in source code.
 * Supports both dot notation and bracket notation.
 *
 * Examples:
 *   process.env.MY_KEY
 *   process.env["MY_KEY"]
 *   process.env['MY_KEY']
 */
export const PROCESS_ENV_PATTERN =
  /process\.env\.([A-Z_][A-Z0-9_]*)|process\.env\[['"]([A-Z_][A-Z0-9_]*)['"]]/g;

/**
 * Matches import.meta.env.KEY references in source code.
 * Supports both dot notation and bracket notation.
 *
 * Examples:
 *   import.meta.env.VITE_API_URL
 *   import.meta.env["VITE_API_URL"]
 *   import.meta.env['VITE_API_URL']
 */
export const IMPORT_META_ENV_PATTERN =
  /import\.meta\.env\.([A-Z_][A-Z0-9_]*)|import\.meta\.env\[['"]([A-Z_][A-Z0-9_]*)['"]]/g;

/**
 * Matches env.KEY references in source code.
 * Only used when a SvelteKit $env import is detected in the file.
 * Uses negative lookbehind to avoid matching object.env.KEY or myenv.KEY.
 *
 * Example:
 *   env.PUBLIC_API_URL
 */
export const SVELTEKIT_ENV_PATTERN = /(?<![.\w])env\.([A-Z_][A-Z0-9_]*)/g;

/**
 * Detects if a file imports from SvelteKit's $env module.
 * Used to conditionally enable SVELTEKIT_ENV_PATTERN scanning.
 *
 * Example:
 *   import { env } from '$env/dynamic/public'
 */
export const SVELTEKIT_ENV_IMPORT_PATTERN = /from\s+['"](\$env\/)/;

/**
 * Matches SvelteKit static env named imports.
 * Used to map imported identifiers to actual env keys.
 *
 * Examples:
 *   import { SECRET_KEY } from '$env/static/private'
 *   import { PUBLIC_API_URL as API_URL } from "$env/static/public"
 */
export const SVELTEKIT_STATIC_ENV_IMPORT_PATTERN =
  /import\s*\{([^}]*)\}\s*from\s*['"]\$env\/static\/(?:private|public)['"]/g;
