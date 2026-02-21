import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseEnvKeys } from "../envParser";

suite("envParser", () => {
  let tmpFile: string;

  setup(() => {
    // Create a temp file before each test
    tmpFile = path.join(os.tmpdir(), ".env-test-" + Date.now());
  });

  teardown(() => {
    // Clean up temp file after each test
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  });

  test("parses basic key=value pairs", () => {
    fs.writeFileSync(tmpFile, "DB_HOST=localhost\nDB_PORT=5432\n");
    const keys = parseEnvKeys(tmpFile);
    assert.ok(keys.has("DB_HOST"));
    assert.ok(keys.has("DB_PORT"));
  });

  test("ignores comment lines", () => {
    fs.writeFileSync(tmpFile, "# This is a comment\nDB_HOST=localhost\n");
    const keys = parseEnvKeys(tmpFile);
    assert.strictEqual(keys.has("# This is a comment"), false);
    assert.ok(keys.has("DB_HOST"));
  });

  test("ignores empty lines", () => {
    fs.writeFileSync(tmpFile, "\n\nDB_HOST=localhost\n\n");
    const keys = parseEnvKeys(tmpFile);
    assert.strictEqual(keys.size, 1);
  });

  test("handles empty values", () => {
    fs.writeFileSync(tmpFile, "EMPTY_KEY=\n");
    const keys = parseEnvKeys(tmpFile);
    assert.ok(keys.has("EMPTY_KEY"));
  });

  test("returns empty set if file does not exist", () => {
    const keys = parseEnvKeys("/nonexistent/.env");
    assert.strictEqual(keys.size, 0);
  });
});