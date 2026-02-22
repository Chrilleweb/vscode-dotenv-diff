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

  test("does match import.meta.env usage", () => {
    const usages = scanForEnvUsages("const x = import.meta.env.VITE_API_URL;");
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "VITE_API_URL");
  });

  test('does warn import.meta.env["KEY"] usage', () => {
    // This is not currently supported by our regex, but we should at least not crash and ideally warn about it.
    const usages = scanForEnvUsages(
      'const x = import.meta.env["VITE_API_URL"];',
    );
    assert.strictEqual(usages.length, 0);
  });

  test("does warn import.meta.env['KEY'] usage", () => {
    // This is not currently supported by our regex, but we should at least not crash and ideally warn about it.
    const usages = scanForEnvUsages(
      "const x = import.meta.env['VITE_API_URL'];",
    );
    assert.strictEqual(usages.length, 0);
  });

  test("finds SvelteKit env.KEY when $env import is present", () => {
    const source = `
    import { env } from '$env/dynamic/public';
    const url = env.PUBLIC_API_URL;
  `;
    const usages = scanForEnvUsages(source);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("does not match env.KEY without SvelteKit import", () => {
    const source = `
    const env = {};
    const url = env.PUBLIC_API_URL;
  `;
    const usages = scanForEnvUsages(source);
    assert.strictEqual(usages.length, 0);
  });

  test("finds SvelteKit env.KEY from static import", () => {
    const source = `
    import { env } from '$env/static/public';
    const url = env.PUBLIC_API_URL;
  `;
    const usages = scanForEnvUsages(source);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });
});
