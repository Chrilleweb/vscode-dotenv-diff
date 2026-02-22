/**
 * The name of the environment file to look for.
 * Used when walking up the directory tree and in diagnostic messages.
 */
export const ENV_FILE_NAME = ".env";

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
 * Used in Vite-based projects (e.g. Vue, Svelte, Astro).
 *
 * Example:
 *   import.meta.env.VITE_API_URL
 */
export const IMPORT_META_ENV_PATTERN = /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g;