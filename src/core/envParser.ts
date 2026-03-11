import * as fs from "fs";

/**
 * Parses .env content text and returns a set of defined key names.
 * Ignores comments (#) and empty lines.
 * @param text Raw .env text content
 * @returns A set of environment variable keys defined in the content
 */
export function parseEnvKeysFromText(text: string): Set<string> {
  const keys = new Set<string>();
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }

    const key = trimmed.substring(0, eqIndex).trim();
    if (key) {
      keys.add(key);
    }
  }

  return keys;
}

/**
 * Parses a .env file and returns a Set of defined key names.
 * Ignores comments (#) and empty lines.
 *
 * Example: "MY_KEY=hello" → "MY_KEY"
 * @param filePath The full path to the .env file to parse
 * @return A Set of environment variable keys defined in the file
 */
export function parseEnvKeys(filePath: string): Set<string> {
  if (!fs.existsSync(filePath)) {
    return new Set<string>();
  }

  const text = fs.readFileSync(filePath, "utf8");
  return parseEnvKeysFromText(text);
}
