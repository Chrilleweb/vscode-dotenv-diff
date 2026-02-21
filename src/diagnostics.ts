import * as vscode from "vscode";
import { parseEnvKeys } from "./core/envParser";
import { scanForEnvUsages } from "./core/scanner";
import { findNearestEnv } from "./core/fileWalker";
import { ENV_FILE_NAME } from "./core/constants";

/**
 * The single DiagnosticCollection that owns all our warnings.
 * Created once in extension.ts and passed around.
 * @return A new DiagnosticCollection instance for our extension
 */
export function createDiagnosticCollection(): vscode.DiagnosticCollection {
  return vscode.languages.createDiagnosticCollection("dotenv-diff");
}

/**
 * Re-runs all diagnostics across all currently open text documents.
 * Called whenever a document is opened, saved, or closed.
 * @param collection The DiagnosticCollection to update with new diagnostics
 * @return void
 */
export function refreshAllDiagnostics(
  collection: vscode.DiagnosticCollection,
): void {
  collection.clear();

  const openDocs = vscode.workspace.textDocuments;

  // --- Pass 1: Warn about missing keys in .ts/.js files ---
  for (const doc of openDocs) {
    if (!isSourceFile(doc)) {
      continue;
    }

    const envPath = findNearestEnv(doc.fileName);
    const envKeys = envPath ? parseEnvKeys(envPath) : new Set<string>();
    const diagnostics: vscode.Diagnostic[] = [];
    const text = doc.getText();
    const usages = scanForEnvUsages(text);

    for (const usage of usages) {
      if (!envKeys.has(usage.key)) {
        const pos = doc.positionAt(usage.index);
        // Underline the full process.env.KEY token
        const endPos = doc.positionAt(
          usage.index + "process.env.".length + usage.key.length,
        );
        const range = new vscode.Range(pos, endPos);

        const diagnostic = new vscode.Diagnostic(
          range,
          `Environment variable "${usage.key}" is not defined in ${ENV_FILE_NAME}`,
          vscode.DiagnosticSeverity.Warning,
        );
        diagnostic.source = "dotenv-diff";
        diagnostics.push(diagnostic);
      }
    }

    collection.set(doc.uri, diagnostics);
  }

  // --- Pass 2: Warn about unused keys in open .env files ---
  // Collect all keys used across all open source files
  const allUsedKeys = new Set<string>();

  for (const doc of openDocs) {
    if (!isSourceFile(doc)) {
      continue;
    }
    const usages = scanForEnvUsages(doc.getText());
    usages.forEach((u) => allUsedKeys.add(u.key));
  }

  // Check each open .env file
  for (const doc of openDocs) {
    if (!isEnvFile(doc)) {
      continue;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const lines = doc.getText().split("\n");

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex <= 0) {
        return;
      }

      const key = trimmed.substring(0, eqIndex).trim();

      if (key && !allUsedKeys.has(key)) {
        const range = new vscode.Range(lineIndex, 0, lineIndex, key.length);
        const diagnostic = new vscode.Diagnostic(
          range,
          `Environment variable "${key}" is defined but never used in ${ENV_FILE_NAME}`,
          vscode.DiagnosticSeverity.Warning,
        );
        diagnostic.source = "dotenv-diff";
        diagnostics.push(diagnostic);
      }
    });

    collection.set(doc.uri, diagnostics);
  }
}

/**
 * Helper function to determine if a document is a TypeScript or JavaScript source file.
 * @param doc The TextDocument to check
 * @returns True if the document is a .ts or .js file, false otherwise
 */
function isSourceFile(doc: vscode.TextDocument): boolean {
  return doc.languageId === "typescript" || doc.languageId === "javascript";
}

/**
 * Helper function to determine if a document is a .env file.
 * @param doc The TextDocument to check
 * @returns True if the document's filename ends with .env, false otherwise
 */
function isEnvFile(doc: vscode.TextDocument): boolean {
  return doc.fileName.endsWith(ENV_FILE_NAME);
}
