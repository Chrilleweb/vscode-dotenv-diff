import * as assert from "assert";
import { isInComment } from "../../core/commentDetector";

suite("commentDetector", () => {
  test("detects single-line comment", () => {
    assert.strictEqual(isInComment("// process.env.KEY", 3), true);
  });

  test("detects block comment", () => {
    assert.strictEqual(isInComment("/* process.env.KEY */", 3), true);
  });

  test("detects JSDoc comment", () => {
    assert.strictEqual(isInComment("/** process.env.KEY */", 4), true);
  });

  test("detects continuation line in block comment", () => {
    assert.strictEqual(isInComment("/**\n * process.env.KEY\n */", 7), true);
  });

  test("does not flag real usage", () => {
    assert.strictEqual(isInComment("const x = process.env.KEY;", 10), false);
  });

  test("does not flag usage after a closed block comment", () => {
    assert.strictEqual(
      isInComment("/* comment */ const x = process.env.KEY;", 24),
      false
    );
  });
});