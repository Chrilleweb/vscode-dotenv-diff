import * as assert from "assert";
import { scanForEnvUsages } from "../core/scanner";

suite("scanner", () => {
  test("finds dot notation usage", () => {
    const usages = scanForEnvUsages("const x = process.env.MY_KEY;");
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "MY_KEY");
  });

  test("finds bracket notation with double quotes", () => {
    const usages = scanForEnvUsages('const x = process.env["MY_KEY"];');
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "MY_KEY");
  });

  test("finds bracket notation with single quotes", () => {
    const usages = scanForEnvUsages("const x = process.env['MY_KEY'];");
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "MY_KEY");
  });

  test("finds multiple usages in one file", () => {
    const source = `
      const a = process.env.KEY_ONE;
      const b = process.env.KEY_TWO;
      const c = process.env.KEY_THREE;
    `;
    const usages = scanForEnvUsages(source);
    assert.strictEqual(usages.length, 3);
    assert.deepStrictEqual(
      usages.map((u) => u.key),
      ["KEY_ONE", "KEY_TWO", "KEY_THREE"],
    );
  });

  test("returns empty array when no usages found", () => {
    const usages = scanForEnvUsages("const x = 42;");
    assert.strictEqual(usages.length, 0);
  });

  test("does not match lowercase keys", () => {
    // Our regex only matches UPPER_CASE keys (convention)
    const usages = scanForEnvUsages("const x = process.env.mykey;");
    assert.strictEqual(usages.length, 0);
  });

  test("ignores process.env.KEY in single-line comments", () => {
    const usages = scanForEnvUsages("// process.env.MY_KEY");
    assert.strictEqual(usages.length, 0);
  });

  test("ignores process.env.KEY in block comments", () => {
    const usages = scanForEnvUsages("/* process.env.MY_KEY */");
    assert.strictEqual(usages.length, 0);
  });

  test("ignores process.env.KEY in JSDoc comments", () => {
    const usages = scanForEnvUsages("/** \n * process.env.MY_KEY \n */");
    assert.strictEqual(usages.length, 0);
  });

  test("still finds real usage after a comment", () => {
    const source = `
    // process.env.FAKE_KEY
    const x = process.env.REAL_KEY;
  `;
    const usages = scanForEnvUsages(source);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "REAL_KEY");
  });
});
