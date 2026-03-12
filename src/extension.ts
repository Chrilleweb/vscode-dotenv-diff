import * as vscode from "vscode";
import * as fs from "fs";
import { SOURCE_FILE_GLOB, EXCLUDE_FILE_GLOB } from "./core/constants";
import {
  createEnvCompletionProvider,
  shouldAutoTriggerMissingEnvSuggestions,
} from "./completionProvider";
import { getMissingEnvKeysForEnvText } from "./core/missingEnvKeys";
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
  const DIAGNOSTICS_DEBOUNCE_MS = 120;
  const DIAGNOSTICS_MAX_STALE_MS = 350;

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
  let diagnosticsRefreshTimer: NodeJS.Timeout | undefined;
  let lastDiagnosticsRefreshAt = 0;

  const runDiagnosticsRefresh = () => {
    refresh();
    lastDiagnosticsRefreshAt = Date.now();
  };

  const scheduleDiagnosticsRefresh = (mode: "immediate" | "debounced" = "debounced") => {
    if (mode === "immediate") {
      if (diagnosticsRefreshTimer) {
        clearTimeout(diagnosticsRefreshTimer);
        diagnosticsRefreshTimer = undefined;
      }

      runDiagnosticsRefresh();
      return;
    }

    const now = Date.now();
    if (now - lastDiagnosticsRefreshAt >= DIAGNOSTICS_MAX_STALE_MS) {
      if (diagnosticsRefreshTimer) {
        clearTimeout(diagnosticsRefreshTimer);
        diagnosticsRefreshTimer = undefined;
      }

      runDiagnosticsRefresh();
      return;
    }

    if (diagnosticsRefreshTimer) {
      clearTimeout(diagnosticsRefreshTimer);
    }

    // Debounce frequent editor/workspace events to avoid diagnostics flicker.
    diagnosticsRefreshTimer = setTimeout(() => {
      runDiagnosticsRefresh();
      diagnosticsRefreshTimer = undefined;
    }, DIAGNOSTICS_DEBOUNCE_MS);
  };

  const envCompletionProvider = createEnvCompletionProvider(workspaceFileContents);

  let autoSuggestTimer: NodeJS.Timeout | undefined;

  const triggerEnvSuggestionsIfNeeded = (editor?: vscode.TextEditor) => {
    if (!editor || !editor.selection.isEmpty) {
      return;
    }

    const position = editor.selection.active;
    if (!shouldAutoTriggerMissingEnvSuggestions(editor.document, position)) {
      return;
    }

    const missingKeys = getMissingEnvKeysForEnvText(
      editor.document.getText(),
      workspaceFileContents,
      editor.document.fileName,
    );
    if (missingKeys.length === 0) {
      return;
    }

    if (autoSuggestTimer) {
      clearTimeout(autoSuggestTimer);
    }

    const expectedDocument = editor.document;
    autoSuggestTimer = setTimeout(() => {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor || activeEditor.document !== expectedDocument) {
        return;
      }

      if (!activeEditor.selection.isEmpty) {
        return;
      }

      const activePosition = activeEditor.selection.active;
      if (
        !shouldAutoTriggerMissingEnvSuggestions(
          activeEditor.document,
          activePosition,
        )
      ) {
        return;
      }

      const activeMissingKeys = getMissingEnvKeysForEnvText(
        activeEditor.document.getText(),
        workspaceFileContents,
        activeEditor.document.fileName,
      );
      if (activeMissingKeys.length === 0) {
        return;
      }

      void vscode.commands.executeCommand("editor.action.triggerSuggest");
    }, 50);
  };

  runDiagnosticsRefresh();

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      workspaceFileContents.set(doc.fileName, doc.getText());
      scheduleDiagnosticsRefresh("immediate");

      if (vscode.window.activeTextEditor?.document === doc) {
        triggerEnvSuggestionsIfNeeded(vscode.window.activeTextEditor);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.contentChanges.length === 0) {
        return;
      }

      workspaceFileContents.set(e.document.fileName, e.document.getText());
      scheduleDiagnosticsRefresh();

      if (vscode.window.activeTextEditor?.document === e.document) {
        triggerEnvSuggestionsIfNeeded(vscode.window.activeTextEditor);
      }
    }),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      triggerEnvSuggestionsIfNeeded(editor);
    }),
    vscode.window.onDidChangeTextEditorSelection((event) => {
      triggerEnvSuggestionsIfNeeded(event.textEditor);
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      workspaceFileContents.delete(doc.fileName);
      collection.delete(doc.uri);
      scheduleDiagnosticsRefresh("immediate");
    }),
    vscode.workspace.onDidSaveTextDocument((doc) => {
      workspaceFileContents.set(doc.fileName, doc.getText());
      scheduleDiagnosticsRefresh("immediate");
    }),
    vscode.languages.registerCompletionItemProvider(
      { pattern: "**/.env" },
      envCompletionProvider,
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""),
    ),
    collection,
    new vscode.Disposable(() => {
      if (diagnosticsRefreshTimer) {
        clearTimeout(diagnosticsRefreshTimer);
      }
      if (autoSuggestTimer) {
        clearTimeout(autoSuggestTimer);
      }
    }),
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * VS Code automatically disposes everything in context.subscriptions.
 */
export function deactivate(): void {}
