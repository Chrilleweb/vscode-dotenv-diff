import * as assert from "assert";
import { isInComment } from "../../core/commentDetector";

suite("commentDetector", () => {
  test("detects inline single-line comment after code", () => {
    const text = "const x = 1; // process.env.KEY";
    assert.strictEqual(
      isInComment(text, text.indexOf("process.env.KEY")),
      true,
    );
  });

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
      false,
    );
  });

  test("does not detect content inside template literals", () => {
    const text = "const s = `process.env.KEY`;";
    assert.strictEqual(
      isInComment(text, text.indexOf("process.env.KEY")),
      false,
    );
  });
});
