import * as vscode from "vscode";
import * as fs from "fs";
import { SOURCE_FILE_GLOB, EXCLUDE_FILE_GLOB } from "./core/constants";
import {
  createDiagnosticCollection,
  refreshAllDiagnostics,
} from "./diagnostics";

/**
 * Called by VS Code when the extension is first activated.
 * Sets up diagnostics and registers all event listeners.
 * @param context The extension context provided by VS Code on activation
 * @return void
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const collection = createDiagnosticCollection();

  const workspaceFiles = await vscode.workspace.findFiles(
    SOURCE_FILE_GLOB,
    EXCLUDE_FILE_GLOB,
  );

  const workspaceFileContents = new Map<string, string>();
  for (const file of workspaceFiles) {
    try {
      const content = fs.readFileSync(file.fsPath, "utf8");
      workspaceFileContents.set(file.fsPath, content);
    } catch {
      // Skip files that cannot be read
    }
  }

  const refresh = () =>
    refreshAllDiagnostics(collection, workspaceFileContents);

  refresh();

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      workspaceFileContents.set(doc.fileName, doc.getText());
      refresh();
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      workspaceFileContents.set(e.document.fileName, e.document.getText());
      refresh();
    }),
    vscode.workspace.onDidCloseTextDocument(() => refresh()),
    vscode.workspace.onDidSaveTextDocument(() => refresh()),
    collection,
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * VS Code automatically disposes everything in context.subscriptions.
 */
export function deactivate(): void {}
