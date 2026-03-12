import * as vscode from "vscode";
import { ENV_FILE_NAME } from "./core/constants";
import { getMissingEnvKeysForEnvText } from "./core/missingEnvKeys";

const COMPLETION_DESCRIPTION = "Add missing environment variable";
const ADD_ALL_COMPLETION_LABEL = "Add all missing environment variables";
const ADD_ALL_COMPLETION_DESCRIPTION =
  "Add all missing environment variables";
const ENV_KEY_PATTERN = /[A-Z_][A-Z0-9_]*$/;

/**
 * Creates a completion provider that suggests missing environment variables
 * while editing .env files.
 * @param workspaceFiles A map of absolute file paths to their current text content
 * @returns A completion provider for .env files
 */
export function createEnvCompletionProvider(
  workspaceFiles: ReadonlyMap<string, string>,
): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document, position) {
      if (!shouldSuggestMissingEnvAtPosition(document, position)) {
        return [];
      }

      const line = document.lineAt(position.line);
      const linePrefix = line.text.slice(0, position.character);
      const missingKeys = getMissingEnvKeysForEnvText(
        document.getText(),
        workspaceFiles,
        document.fileName,
      );

      if (missingKeys.length === 0) {
        return [];
      }

      const replacementRange = getReplacementRange(linePrefix, position);
      const items = missingKeys.map((key) => createCompletionItem(key, replacementRange));

      if (missingKeys.length > 1) {
        items.unshift(createAddAllCompletionItem(missingKeys, replacementRange));
      }

      return items;
    },
  };
}

/**
 * Returns true when completion suggestions are valid at the current cursor position.
 * @param document The active text document
 * @param position The cursor position in the document
 * @returns True when suggestions should be provided at this position
 */
export function shouldSuggestMissingEnvAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  if (!isEnvDocument(document)) {
    return false;
  }

  const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
  const trimmedPrefix = linePrefix.trim();

  if (trimmedPrefix.startsWith("#") || trimmedPrefix.includes("=")) {
    return false;
  }

  return true;
}

/**
 * Returns true when editor should auto-open suggestions without user typing.
 * @param document The active text document
 * @param position The cursor position in the document
 * @returns True when the current line is empty and eligible for suggestions
 */
export function shouldAutoTriggerMissingEnvSuggestions(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  if (!shouldSuggestMissingEnvAtPosition(document, position)) {
    return false;
  }

  const fullLine = document.lineAt(position.line).text;
  return fullLine.trim().length === 0;
}

/**
 * Returns true when the document path points to a .env file.
 * @param document The VS Code document being edited
 * @returns True if this is a .env document
 */
function isEnvDocument(document: vscode.TextDocument): boolean {
  return document.fileName.endsWith(ENV_FILE_NAME);
}

/**
 * Computes the text range that should be replaced when a suggestion is accepted.
 * @param linePrefix The line content before the cursor
 * @param position Current cursor position
 * @returns Range for replacing the current env-key prefix
 */
function getReplacementRange(
  linePrefix: string,
  position: vscode.Position,
): vscode.Range {
  const keyMatch = ENV_KEY_PATTERN.exec(linePrefix);
  if (!keyMatch) {
    return new vscode.Range(position, position);
  }

  const start = new vscode.Position(position.line, keyMatch.index);
  return new vscode.Range(start, position);
}

/**
 * Builds a completion item for a missing environment variable key.
 * @param key The environment variable key to suggest
 * @param range The editor range to replace on insert
 * @returns Completion item configured for env insertion
 */
function createCompletionItem(key: string, range: vscode.Range): vscode.CompletionItem {
  const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Variable);

  item.detail = COMPLETION_DESCRIPTION;
  item.insertText = new vscode.SnippetString(`${key}=`);
  item.range = range;
  item.filterText = key;
  item.sortText = key;

  return item;
}

/**
 * Builds a completion item that inserts all missing environment variables at once.
 * @param missingKeys Missing keys in sorted order
 * @param range The editor range to replace on insert
 * @returns Completion item configured for bulk insertion
 */
function createAddAllCompletionItem(
  missingKeys: readonly string[],
  range: vscode.Range,
): vscode.CompletionItem {
  const item = new vscode.CompletionItem(
    ADD_ALL_COMPLETION_LABEL,
    vscode.CompletionItemKind.Variable,
  );

  item.detail = ADD_ALL_COMPLETION_DESCRIPTION;
  item.insertText = buildAddAllSnippet(missingKeys);
  item.range = range;
  item.sortText = "0000";

  return item;
}

/**
 * Creates the snippet used by the bulk insert completion item.
 * @param missingKeys Missing keys in sorted order
 * @returns Snippet containing one key-value line per missing key
 */
function buildAddAllSnippet(missingKeys: readonly string[]): vscode.SnippetString {
  const lines = missingKeys.map((key) => `${key}=`);
  return new vscode.SnippetString(lines.join("\n"));
}
