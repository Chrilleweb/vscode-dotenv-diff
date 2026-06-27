import * as assert from "assert";
import {
  isSourceFilePath,
  isInExcludedDirectory,
} from "../../core/sourceFileMatcher";

suite("sourceFileMatcher", () => {
  test("matches supported source file extensions", () => {
    assert.strictEqual(isSourceFilePath("src/app.ts"), true);
    assert.strictEqual(isSourceFilePath("src/app.tsx"), true);
    assert.strictEqual(isSourceFilePath("src/app.js"), true);
    assert.strictEqual(isSourceFilePath("src/app.jsx"), true);
    assert.strictEqual(isSourceFilePath("src/app.mjs"), true);
    assert.strictEqual(isSourceFilePath("src/app.cjs"), true);
    assert.strictEqual(isSourceFilePath("src/app.mts"), true);
    assert.strictEqual(isSourceFilePath("src/app.cts"), true);
    assert.strictEqual(isSourceFilePath("src/app.svelte"), true);
  });

  test("does not match non-source extensions", () => {
    assert.strictEqual(isSourceFilePath("src/app.json"), false);
    assert.strictEqual(isSourceFilePath("src/app.env"), false);
    assert.strictEqual(isSourceFilePath("src/app.md"), false);
  });

  test("excludes .test.ts and .test.js files", () => {
    assert.strictEqual(isSourceFilePath("src/app.test.ts"), false);
    assert.strictEqual(isSourceFilePath("src/app.test.js"), false);
  });

  test("excludes .spec.ts and .spec.js files", () => {
    assert.strictEqual(isSourceFilePath("src/app.spec.ts"), false);
    assert.strictEqual(isSourceFilePath("src/app.spec.js"), false);
    assert.strictEqual(isSourceFilePath("src/app.spec.svelte"), false);
  });

  test("excludes files inside node_modules and build-output directories", () => {
    assert.strictEqual(
      isSourceFilePath("node_modules/dotenv/lib/main.js"),
      false,
    );
    assert.strictEqual(
      isSourceFilePath("project/node_modules/styled-components/dist/index.js"),
      false,
    );
    assert.strictEqual(
      isSourceFilePath("C:\\repo\\node_modules\\dotenv\\lib\\main.js"),
      false,
    );
    assert.strictEqual(isSourceFilePath("dist/app.js"), false);
    assert.strictEqual(isSourceFilePath("build/app.js"), false);
    assert.strictEqual(isSourceFilePath("out/app.js"), false);
    assert.strictEqual(isSourceFilePath(".next/server/app.js"), false);
  });

  test("does not exclude source files whose name merely contains a segment word", () => {
    assert.strictEqual(isSourceFilePath("src/distribute.ts"), true);
    assert.strictEqual(isSourceFilePath("src/outbox.ts"), true);
  });

  test("isInExcludedDirectory detects excluded path segments", () => {
    assert.strictEqual(
      isInExcludedDirectory("project/node_modules/pkg/index.js"),
      true,
    );
    assert.strictEqual(
      isInExcludedDirectory("C:\\repo\\dist\\bundle.js"),
      true,
    );
    assert.strictEqual(isInExcludedDirectory("src/app.ts"), false);
    assert.strictEqual(isInExcludedDirectory("src/distribute.ts"), false);
  });
});
