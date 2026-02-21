import * as vscode from "vscode";
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
export function activate(context: vscode.ExtensionContext): void {
  const collection = createDiagnosticCollection();

  // Run once on startup for already-open files
  refreshAllDiagnostics(collection);

  // Re-run when a file is opened or its content changes
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(() =>
      refreshAllDiagnostics(collection),
    ),
    vscode.workspace.onDidChangeTextDocument(() =>
      refreshAllDiagnostics(collection),
    ),
    vscode.workspace.onDidCloseTextDocument(() =>
      refreshAllDiagnostics(collection),
    ),
    vscode.workspace.onDidSaveTextDocument(() =>
      refreshAllDiagnostics(collection),
    ),
    collection,
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * VS Code automatically disposes everything in context.subscriptions.
 */
export function deactivate(): void {}
