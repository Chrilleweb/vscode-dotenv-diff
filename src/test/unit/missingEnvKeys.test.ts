import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
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

  test("excludes default runtime keys by default", () => {
    const workspaceFiles = new Map<string, string>([
      [
        "/workspace/src/app.ts",
        "process.env.API_URL; process.env.NODE_ENV; import.meta.env.VITE_MODE;",
      ],
    ]);

    const missing = getMissingEnvKeysForEnvText("", workspaceFiles);

    assert.deepStrictEqual(missing, ["API_URL"]);
  });

  test("scopes missing keys to the nearest env file in monorepos", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dotenv-diff-"));

    try {
      const frontendDir = path.join(tempRoot, "apps", "frontend");
      const backendDir = path.join(tempRoot, "apps", "backend");
      const frontendSrc = path.join(frontendDir, "src");
      const backendSrc = path.join(backendDir, "src");
      const frontendEnv = path.join(frontendDir, ".env");
      const backendEnv = path.join(backendDir, ".env");
      const frontendFile = path.join(frontendSrc, "app.ts");
      const backendFile = path.join(backendSrc, "server.ts");

      fs.mkdirSync(frontendSrc, { recursive: true });
      fs.mkdirSync(backendSrc, { recursive: true });
      fs.writeFileSync(frontendEnv, "", "utf8");
      fs.writeFileSync(backendEnv, "", "utf8");

      const workspaceFiles = new Map<string, string>([
        [frontendFile, "process.env.FRONTEND_ONLY"],
        [backendFile, "process.env.BACKEND_ONLY"],
      ]);

      const frontendMissing = getMissingEnvKeysForEnvText(
        "",
        workspaceFiles,
        frontendEnv,
      );
      const backendMissing = getMissingEnvKeysForEnvText(
        "",
        workspaceFiles,
        backendEnv,
      );

      assert.deepStrictEqual(frontendMissing, ["FRONTEND_ONLY"]);
      assert.deepStrictEqual(backendMissing, ["BACKEND_ONLY"]);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
