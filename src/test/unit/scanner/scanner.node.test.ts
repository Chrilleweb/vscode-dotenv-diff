import * as assert from "assert";
import { scanForEnvUsages } from "../../../core/scanner";
import {
  multipleProcessEnvDotNotation,
  processEnvDestructuring,
  processEnvDestructuringWithAliasAndDefault,
  processEnvBracketDoubleQuotes,
  processEnvBracketSingleQuotes,
  processEnvDotNotation,
  processEnvLowercaseKey,
} from "../../fixtures/node";

suite("scanner (node)", () => {
  test("finds process.env dot notation usage", () => {
    const usages = scanForEnvUsages(processEnvDotNotation);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("finds process.env bracket notation with double quotes", () => {
    const usages = scanForEnvUsages(processEnvBracketDoubleQuotes);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("finds process.env bracket notation with single quotes", () => {
    const usages = scanForEnvUsages(processEnvBracketSingleQuotes);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("finds multiple process.env usages in one file", () => {
    const usages = scanForEnvUsages(multipleProcessEnvDotNotation);
    assert.strictEqual(usages.length, 3);
    assert.deepStrictEqual(
      usages.map((usage) => usage.key),
      ["KEY_ONE", "KEY_TWO", "KEY_THREE"],
    );
  });

  test("does not match lowercase process.env keys", () => {
    const usages = scanForEnvUsages(processEnvLowercaseKey);
    assert.strictEqual(usages.length, 0);
  });

  test("finds process.env destructuring usage", () => {
    const usages = scanForEnvUsages(processEnvDestructuring);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "PUBLIC_API_URL");
  });

  test("finds process.env destructuring with alias and default", () => {
    const usages = scanForEnvUsages(processEnvDestructuringWithAliasAndDefault);
    assert.strictEqual(usages.length, 3);
    assert.deepStrictEqual(
      usages.map((usage) => usage.key),
      ["SECRET_KEY", "API_TOKEN", "PUBLIC_URL"],
    );
  });
});
