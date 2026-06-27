import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import {
  createDiagnosticCollection,
  refreshAllDiagnostics,
} from "../../diagnostics";

suite("diagnostics", () => {
  let tmpDir: string;
  let collection: vscode.DiagnosticCollection;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dotenv-diff-diag-"));
    collection = createDiagnosticCollection();
  });

  teardown(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    collection.dispose();
  });

  test("produces no diagnostics for a source file when no .env file exists nearby", async () => {
    const sourceFile = path.join(tmpDir, "app.ts");
    fs.writeFileSync(sourceFile, "const x = process.env.SOME_KEY;");

    const doc = await vscode.workspace.openTextDocument(sourceFile);
    const workspaceFiles = new Map([[sourceFile, doc.getText()]]);

    refreshAllDiagnostics(collection, workspaceFiles);

    const diagnostics = collection.get(doc.uri) ?? [];
    assert.strictEqual(
      diagnostics.length,
      0,
      "Expected no diagnostics when there is no .env file to check against",
    );
  });

  test("produces diagnostics for a source file when a .env file exists but the key is missing", async () => {
    const envFile = path.join(tmpDir, ".env");
    fs.writeFileSync(envFile, "DEFINED_KEY=value\n");

    const sourceFile = path.join(tmpDir, "app.ts");
    fs.writeFileSync(sourceFile, "const x = process.env.MISSING_KEY;");

    const doc = await vscode.workspace.openTextDocument(sourceFile);
    const workspaceFiles = new Map([[sourceFile, doc.getText()]]);

    refreshAllDiagnostics(collection, workspaceFiles);

    const diagnostics = collection.get(doc.uri) ?? [];
    assert.strictEqual(
      diagnostics.length,
      1,
      "Expected one diagnostic for a key missing from the .env file",
    );
    assert.ok(
      diagnostics[0].message.includes("MISSING_KEY"),
      "Diagnostic message should reference the missing key name",
    );
  });
});
