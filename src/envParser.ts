import * as fs from "fs";

/**
 * Parses a .env file and returns a Set of defined key names.
 * Ignores comments (#) and empty lines.
 *
 * Example: "MY_KEY=hello" → "MY_KEY"
 * @param filePath The full path to the .env file to parse
 * @return A Set of environment variable keys defined in the file
 */
export function parseEnvKeys(filePath: string): Set<string> {
  // The set of keys found in the .env file
  const keys = new Set<string>();

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return keys;
  }

  // Read the file and split into lines
  const lines = fs.readFileSync(filePath, "utf8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Extract key (everything before the first =)
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      if (key) {
        keys.add(key);
      }
    }
  }

  return keys;
}
