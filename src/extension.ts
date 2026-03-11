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
      );
      if (activeMissingKeys.length === 0) {
        return;
      }

      void vscode.commands.executeCommand("editor.action.triggerSuggest");
    }, 50);
  };

  refresh();

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      workspaceFileContents.set(doc.fileName, doc.getText());
      refresh();

      if (vscode.window.activeTextEditor?.document === doc) {
        triggerEnvSuggestionsIfNeeded(vscode.window.activeTextEditor);
      }
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      workspaceFileContents.set(e.document.fileName, e.document.getText());
      refresh();

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
    vscode.workspace.onDidCloseTextDocument(() => refresh()),
    vscode.workspace.onDidSaveTextDocument(() => refresh()),
    vscode.languages.registerCompletionItemProvider(
      { pattern: "**/.env" },
      envCompletionProvider,
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""),
    ),
    collection,
  );
}

/**
 * Called by VS Code when the extension is deactivated.
 * VS Code automatically disposes everything in context.subscriptions.
 */
export function deactivate(): void {}
