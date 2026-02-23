import * as assert from "assert";
import { scanForEnvUsages } from "../../../core/scanner";
import {
  dynamicPrivateImport,
  dynamicPublicImport,
  staticPrivateImport,
  staticPublicImport,
  staticImportWithoutUsage,
  staticAliasedImport,
  envWithoutImport,
} from "../../fixtures/sveltekit";

suite("scanner (sveltekit)", () => {
  test("finds SvelteKit env.KEY when $env/dynamic/private import is present", () => {
    const usages = scanForEnvUsages(dynamicPrivateImport);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "SECRET_KEY");
  });

  test("finds SvelteKit env.KEY when $env/dynamic/public import is present", () => {
    const usages = scanForEnvUsages(dynamicPublicImport);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("finds SvelteKit env.KEY when $env/static/private import is present", () => {
    const usages = scanForEnvUsages(staticPrivateImport);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "SECRET_KEY");
  });

  test("finds SvelteKit env.KEY when $env/static/public import is present", () => {
    const usages = scanForEnvUsages(staticPublicImport);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("does not count static import declaration as usage", () => {
    const usages = scanForEnvUsages(staticImportWithoutUsage);
    assert.strictEqual(usages.length, 0);
  });

  test("maps static aliased import usage back to original env key", () => {
    const usages = scanForEnvUsages(staticAliasedImport);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "SECRET_KEY");
  });

  test("does not match env.KEY without SvelteKit import", () => {
    const usages = scanForEnvUsages(envWithoutImport);
    assert.strictEqual(usages.length, 0);
  });

  test("ignores SvelteKit env usage inside template literals and comments", () => {
    const source = `
      import { env } from '$env/dynamic/public';
      const fixture = \`const url = env.PUBLIC_API_URL;\`;
      // const ignored = env.PUBLIC_IN_COMMENT;
      const real = env.PUBLIC_REAL;
    `;

    const usages = scanForEnvUsages(source);
    assert.deepStrictEqual(
      usages.map((usage) => usage.key),
      ["PUBLIC_REAL"],
    );
  });
});
