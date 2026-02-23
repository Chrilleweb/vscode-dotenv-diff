import * as assert from "assert";
import { isSourceFilePath } from "../../core/sourceFileMatcher";

suite("sourceFileMatcher", () => {
  test("matches supported source file extensions", () => {
    assert.strictEqual(isSourceFilePath("src/app.ts"), true);
    assert.strictEqual(isSourceFilePath("src/app.js"), true);
    assert.strictEqual(isSourceFilePath("src/app.mjs"), true);
    assert.strictEqual(isSourceFilePath("src/app.cjs"), true);
    assert.strictEqual(isSourceFilePath("src/app.mts"), true);
    assert.strictEqual(isSourceFilePath("src/app.cts"), true);
  });

  test("does not match non-source extensions", () => {
    assert.strictEqual(isSourceFilePath("src/app.tsx"), false);
    assert.strictEqual(isSourceFilePath("src/app.jsx"), false);
    assert.strictEqual(isSourceFilePath("src/app.json"), false);
    assert.strictEqual(isSourceFilePath("src/app.env"), false);
  });

  test("excludes .test.ts and .test.js files", () => {
    assert.strictEqual(isSourceFilePath("src/app.test.ts"), false);
    assert.strictEqual(isSourceFilePath("src/app.test.js"), false);
  });

  test("excludes .spec.ts and .spec.js files", () => {
    assert.strictEqual(isSourceFilePath("src/app.spec.ts"), false);
    assert.strictEqual(isSourceFilePath("src/app.spec.js"), false);
  });
});
