import * as assert from "assert";
import { getMissingEnvKeysForEnvText } from "../../core/missingEnvKeys";

suite("missingEnvKeys", () => {
  test("returns used keys that are missing in current .env text", () => {
    const workspaceFiles = new Map<string, string>([
      ["/workspace/src/app.ts", "process.env.API_URL; process.env.JWT_SECRET;"],
      ["/workspace/src/server.ts", "process.env.REDIS_URL;"],
    ]);

    const missing = getMissingEnvKeysForEnvText("DATABASE_URL=postgres://localhost\n", workspaceFiles);

    assert.deepStrictEqual(missing, ["API_URL", "JWT_SECRET", "REDIS_URL"]);
  });

  test("excludes keys already defined in current .env text", () => {
    const workspaceFiles = new Map<string, string>([
      ["/workspace/src/app.ts", "process.env.API_URL; process.env.JWT_SECRET;"],
    ]);

    const missing = getMissingEnvKeysForEnvText("API_URL=https://example.com\n", workspaceFiles);

    assert.deepStrictEqual(missing, ["JWT_SECRET"]);
  });

  test("ignores non-source files", () => {
    const workspaceFiles = new Map<string, string>([
      ["/workspace/README.md", "process.env.SHOULD_NOT_COUNT"],
      ["/workspace/src/app.ts", "process.env.API_URL"],
    ]);

    const missing = getMissingEnvKeysForEnvText("", workspaceFiles);

    assert.deepStrictEqual(missing, ["API_URL"]);
  });
});
