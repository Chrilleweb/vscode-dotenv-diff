import * as assert from "assert";
import { scanForEnvUsages } from "../../../core/scanner";

suite("scanner", () => {
  test("returns empty array when no usages found", () => {
    const usages = scanForEnvUsages("const x = 42;");
    assert.strictEqual(usages.length, 0);
  });

  test("ignores env-like content inside plain strings", () => {
    const usages = scanForEnvUsages("const text = 'process.env.MY_KEY';");
    assert.strictEqual(usages.length, 0);
  });
});
