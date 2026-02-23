import * as assert from "assert";
import { scanForEnvUsages } from "../../../core/scanner";

suite("scanner (vite)", () => {
  test("does match import.meta.env usage", () => {
    const usages = scanForEnvUsages("const x = import.meta.env.VITE_API_URL;");
    assert.strictEqual(usages.length, 1);
    assert.strictEqual(usages[0].key, "VITE_API_URL");
  });

  test('does warn import.meta.env["KEY"] usage', () => {
    const usages = scanForEnvUsages(
      'const x = import.meta.env["VITE_API_URL"];',
    );
    assert.strictEqual(usages.length, 0);
  });

  test("does warn import.meta.env['KEY'] usage", () => {
    const usages = scanForEnvUsages(
      "const x = import.meta.env['VITE_API_URL'];",
    );
    assert.strictEqual(usages.length, 0);
  });
});
