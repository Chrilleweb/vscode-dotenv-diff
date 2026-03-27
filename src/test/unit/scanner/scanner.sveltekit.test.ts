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
  dynamicDestructuringSingleKey,
  dynamicDestructuringAliasAndFallback,
  dynamicDestructuringWithoutImport,
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

  test("finds single key in env destructuring with SvelteKit import", () => {
    const usages = scanForEnvUsages(dynamicDestructuringSingleKey);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "SECRET_KEY");
  });

  test("finds all keys in env destructuring with alias and fallback", () => {
    const usages = scanForEnvUsages(dynamicDestructuringAliasAndFallback);
    const keys = usages.map((u) => u.key).sort();
    assert.deepStrictEqual(keys, ["PUBLIC_API_URL", "PUBLIC_BASE_URL"]);
  });

  test("does not detect env destructuring without SvelteKit import", () => {
    const usages = scanForEnvUsages(dynamicDestructuringWithoutImport);
    assert.strictEqual(usages.length, 0);
  });
});
