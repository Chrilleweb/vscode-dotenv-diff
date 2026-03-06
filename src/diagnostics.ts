import * as vscode from "vscode";
import { isSourceFilePath } from "./core/sourceFileMatcher";
import { parseEnvKeys } from "./core/envParser";
import { scanForEnvUsages } from "./core/scanner";
import { findNearestEnv } from "./core/fileWalker";
import { ENV_EXAMPLE_FILE_NAME, ENV_FILE_NAME } from "./core/constants";

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
 * @param workspaceFiles A map of all file paths to their content in the current workspace
 * @return void
 */
export function refreshAllDiagnostics(
  collection: vscode.DiagnosticCollection,
  workspaceFiles: Map<string, string>,
): void {
  collection.clear();

  const openDocs = vscode.workspace.textDocuments;

  checkMissingKeys(collection, openDocs);
  checkUnusedKeys(collection, openDocs, workspaceFiles);
}

/**
 * Pass 1 — Warns about process.env.KEY references in source files
 * that are not defined in the nearest .env file.
 * @param collection The DiagnosticCollection to update with new diagnostics
 * @param openDocs The currently open text documents in the editor
 * @return void
 */
function checkMissingKeys(
  collection: vscode.DiagnosticCollection,
  openDocs: readonly vscode.TextDocument[],
): void {
  for (const doc of openDocs) {
    if (!isSourceFilePath(doc.fileName)) {
      continue;
    }

    const envPath = findNearestEnv(doc.fileName);
    const envKeys = envPath ? parseEnvKeys(envPath) : new Set<string>();
    const diagnostics: vscode.Diagnostic[] = [];
    const usages = scanForEnvUsages(doc.getText());

    for (const usage of usages) {
      if (!envKeys.has(usage.key)) {
        const pos = doc.positionAt(usage.index);
        const endPos = doc.positionAt(usage.index + usage.matchLength);
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
}

/**
 * Pass 2 — Warns about keys defined in .env files
 * that are never used anywhere in the workspace.
 * @param collection The DiagnosticCollection to update with new diagnostics
 * @param openDocs The currently open text documents in the editor
 * @param workspaceFiles A map of all file paths to their content in the current workspace
 * @return void
 */
function checkUnusedKeys(
  collection: vscode.DiagnosticCollection,
  openDocs: readonly vscode.TextDocument[],
  workspaceFiles: Map<string, string>,
): void {
  const allUsedKeys = new Set<string>();

  for (const [filePath, content] of workspaceFiles) {
    if (!isSourceFilePath(filePath)) {
      continue;
    }
    scanForEnvUsages(content).forEach((u) => allUsedKeys.add(u.key));
  }

  for (const doc of openDocs) {
    const envFileType = getEnvFileType(doc);
    if (!envFileType) {
      continue;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const lines = doc.getText().split("\n");
    const siblingEnvPath =
      envFileType === "example" ? findNearestEnv(doc.fileName) : undefined;
    const siblingEnvKeys = siblingEnvPath
      ? parseEnvKeys(siblingEnvPath)
      : new Set<string>();

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

      const existsInEnv = envFileType === "example" && siblingEnvKeys.has(key);
      if (key && envFileType === "example") {
        const range = new vscode.Range(lineIndex, 0, lineIndex, key.length);

        if (!existsInEnv) {
          const missingDiagnostic = new vscode.Diagnostic(
            range,
            `Environment variable "${key}" is defined in ${ENV_EXAMPLE_FILE_NAME} but missing in ${ENV_FILE_NAME}`,
            vscode.DiagnosticSeverity.Warning,
          );
          missingDiagnostic.source = "dotenv-diff";
          diagnostics.push(missingDiagnostic);
        }

        if (!allUsedKeys.has(key)) {
          const unusedExampleDiagnostic = new vscode.Diagnostic(
            range,
            `Environment variable "${key}" is defined in ${ENV_EXAMPLE_FILE_NAME} but never used`,
            vscode.DiagnosticSeverity.Warning,
          );
          unusedExampleDiagnostic.source = "dotenv-diff";
          diagnostics.push(unusedExampleDiagnostic);
        }

        return;
      }

      if (key && envFileType === "env" && !allUsedKeys.has(key)) {
        const range = new vscode.Range(lineIndex, 0, lineIndex, key.length);
        const diagnostic = new vscode.Diagnostic(
          range,
          `Environment variable "${key}" is defined in ${ENV_FILE_NAME} but never used`,
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
 * Helper function to determine if a document is a .env file.
 * @param doc The TextDocument to check
 * @returns True if the document's filename ends with .env, false otherwise
 */
function isEnvFile(doc: vscode.TextDocument): boolean {
  return doc.fileName.endsWith(ENV_FILE_NAME);
}

/**
 * Helper function to determine if a document is a .env.example file.
 * @param doc The TextDocument to check
 * @returns True if the document's filename ends with .env.example, false otherwise
 */
function isEnvExampleFile(doc: vscode.TextDocument): boolean {
  return doc.fileName.endsWith(ENV_EXAMPLE_FILE_NAME);
}

/**
 * Helper function to determine if a document is either a .env or .env.example file,
 * and returns which type it is. Used to route the correct diagnostics logic.
 * @param doc The TextDocument to check
 * @returns "env" if it's a .env file, "example" if it's a .env.example file, or undefined if neither
 */
function getEnvFileType(
  doc: vscode.TextDocument,
): "env" | "example" | undefined {
  if (isEnvFile(doc)) {
    return "env";
  }

  if (isEnvExampleFile(doc)) {
    return "example";
  }

  return undefined;
}
