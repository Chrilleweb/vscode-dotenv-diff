import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { parseEnvKeys } from "../../core/envParser";
import { findNearestEnv } from "../../core/fileWalker";
import { scanForEnvUsages } from "../../core/scanner";
import { isSourceFilePath } from "../../core/sourceFileMatcher";
import {
  ENV_FILE_NAME,
  IMPORT_META_ENV_PATTERN,
  PROCESS_ENV_PATTERN,
  SVELTEKIT_ENV_IMPORT_PATTERN,
  SVELTEKIT_ENV_PATTERN,
} from "../../core/constants";
import { dynamicPublicImport, envWithoutImport } from "../fixtures/sveltekit";

function collectFilesRecursively(rootDir: string): string[] {
  const files: string[] = [];

  const walk = (currentDir: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else {
        files.push(entryPath);
      }
    }
  };

  walk(rootDir);
  return files;
}

function collectUsedKeysAcrossWorkspace(filePaths: string[]): Set<string> {
  const usedKeys = new Set<string>();

  for (const filePath of filePaths) {
    if (!isSourceFilePath(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    for (const usage of scanForEnvUsages(content)) {
      usedKeys.add(usage.key);
    }
  }

  return usedKeys;
}

suite("core integration", () => {
  let tmpDir: string;

  const writeFile = (relativePath: string, content: string) => {
    const fullPath = path.join(tmpDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
    return fullPath;
  };

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dotenv-diff-int-"));
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("resolves nearest .env and finds missing keys from real source text", () => {
    writeFile(".env", "ROOT_ONLY=1\n");
    const appEnvPath = writeFile(
      path.join("apps", "web", ENV_FILE_NAME),
      "APP_DEFINED=1\nPUBLIC_API_URL=https://api.example.com\n",
    );

    const sourcePath = writeFile(
      path.join("apps", "web", "src", "app.ts"),
      [
        "const a = process.env.APP_DEFINED;",
        "const b = process.env.MISSING_KEY;",
        "const c = import.meta.env.PUBLIC_API_URL;",
        "// process.env.IGNORED_IN_COMMENT",
      ].join("\n"),
    );

    const nearestEnv = findNearestEnv(sourcePath);
    assert.strictEqual(nearestEnv, appEnvPath);

    const envKeys = parseEnvKeys(nearestEnv!);
    const sourceContent = fs.readFileSync(sourcePath, "utf8");
    const usages = scanForEnvUsages(sourceContent);

    assert.deepStrictEqual(
      usages.map((usage) => usage.key),
      ["APP_DEFINED", "MISSING_KEY", "PUBLIC_API_URL"],
    );

    const missingKeys = usages
      .map((usage) => usage.key)
      .filter((key) => !envKeys.has(key));

    assert.deepStrictEqual(missingKeys, ["MISSING_KEY"]);
  });

  test("aggregates used keys across workspace while skipping test and non-source files", () => {
    writeFile(path.join("src", "feature.ts"), "const x = process.env.FEATURE_FLAG;\n");
    writeFile(path.join("src", "build.mjs"), "const id = import.meta.env.BUILD_ID;\n");
    writeFile(
      path.join("src", "feature.test.ts"),
      "const t = process.env.SHOULD_NOT_BE_INCLUDED;\n",
    );
    writeFile("README.md", "process.env.README_KEY\n");

    const allFiles = collectFilesRecursively(tmpDir);
    const usedKeys = collectUsedKeysAcrossWorkspace(allFiles);

    assert.strictEqual(usedKeys.has("FEATURE_FLAG"), true);
    assert.strictEqual(usedKeys.has("BUILD_ID"), true);
    assert.strictEqual(usedKeys.has("SHOULD_NOT_BE_INCLUDED"), false);
    assert.strictEqual(usedKeys.has("README_KEY"), false);
  });

  test("enables SvelteKit env.KEY scanning only when a $env import is present", () => {
    const dynamicUsages = scanForEnvUsages(dynamicPublicImport);
    const noImportUsages = scanForEnvUsages(envWithoutImport);
    const staticImportWithEnvObject = scanForEnvUsages(
      "import { env } from '$env/static/public';\nconst url = env.PUBLIC_WEB_URL;\n",
    );

    assert.deepStrictEqual(
      dynamicUsages.map((usage) => usage.key),
      ["PUBLIC_API_URL"],
    );
    assert.strictEqual(noImportUsages.length, 0);
    assert.deepStrictEqual(
      staticImportWithEnvObject.map((usage) => usage.key),
      ["PUBLIC_WEB_URL"],
    );

    assert.strictEqual(SVELTEKIT_ENV_IMPORT_PATTERN.test(dynamicPublicImport), true);
    assert.strictEqual(SVELTEKIT_ENV_PATTERN.test("env.PUBLIC_API_URL"), true);
  });

  test("core regex patterns match expected env usage formats", () => {
    const processEnvSource = "process.env.MY_KEY process.env['OTHER_KEY'] process.env[\"THIRD_KEY\"]";
    const importMetaSource = "import.meta.env.VITE_API_URL";

    const processMatches = Array.from(processEnvSource.matchAll(PROCESS_ENV_PATTERN)).map(
      (match) => match[1] ?? match[2],
    );
    const importMetaMatches = Array.from(importMetaSource.matchAll(IMPORT_META_ENV_PATTERN)).map(
      (match) => match[1],
    );

    assert.deepStrictEqual(processMatches, ["MY_KEY", "OTHER_KEY", "THIRD_KEY"]);
    assert.deepStrictEqual(importMetaMatches, ["VITE_API_URL"]);
  });
});
