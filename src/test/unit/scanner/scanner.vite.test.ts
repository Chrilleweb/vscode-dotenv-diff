import * as assert from "assert";
import { scanForEnvUsages } from "../../../core/scanner";
import {
  prefixedBracketDoubleQuotes,
  prefixedBracketSingleQuotes,
  prefixedDotNotation,
} from "../../fixtures/vite";

suite("scanner (vite)", () => {
  test("does match import.meta.env usage", () => {
    const usages = scanForEnvUsages(prefixedDotNotation);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "VITE_API_URL");
  });

  test('does warn import.meta.env["KEY"] usage', () => {
    const usages = scanForEnvUsages(prefixedBracketDoubleQuotes);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "VITE_API_URL");
  });

  test("does warn import.meta.env['KEY'] usage", () => {
    const usages = scanForEnvUsages(prefixedBracketSingleQuotes);
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "VITE_API_URL");
  });
});
