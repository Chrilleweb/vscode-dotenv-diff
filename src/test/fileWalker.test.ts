import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { findNearestEnv } from "../core/fileWalker";

suite("fileWalker", () => {
  let tmpDir: string;

  setup(() => {
    // Create a fresh temp directory structure before each test
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dotenv-diff-test-"));
  });

  teardown(() => {
    // Remove temp directory after each test
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("finds .env in same directory", () => {
    const envPath = path.join(tmpDir, ".env");
    fs.writeFileSync(envPath, "KEY=value");

    const result = findNearestEnv(path.join(tmpDir, "app.ts"));
    assert.strictEqual(result, envPath);
  });

  test("finds .env in parent directory", () => {
    const subDir = path.join(tmpDir, "src");
    fs.mkdirSync(subDir);
    const envPath = path.join(tmpDir, ".env");
    fs.writeFileSync(envPath, "KEY=value");

    const result = findNearestEnv(path.join(subDir, "app.ts"));
    assert.strictEqual(result, envPath);
  });

  test("finds nearest .env when multiple exist", () => {
    // .env in root AND in subdir – subdir should win
    const subDir = path.join(tmpDir, "apps", "frontend");
    fs.mkdirSync(subDir, { recursive: true });

    const rootEnv = path.join(tmpDir, ".env");
    const nearestEnv = path.join(subDir, ".env");

    fs.writeFileSync(rootEnv, "ROOT_KEY=value");
    fs.writeFileSync(nearestEnv, "FRONTEND_KEY=value");

    const result = findNearestEnv(path.join(subDir, "app.ts"));
    assert.strictEqual(result, nearestEnv);
  });

  test("returns null if no .env exists", () => {
    const result = findNearestEnv(path.join(tmpDir, "app.ts"));
    assert.strictEqual(result, null);
  });
});
