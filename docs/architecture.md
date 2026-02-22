# Architecture

This document explains how `vscode-dotenv-diff` is structured, how the modules relate to each other, and the reasoning behind key design decisions.

---

## Project structure

```
src/
├── core/                 # Pure logic – no VS Code dependency
├── test/                 # Pure logic tests – no VS Code dependency
├── diagnostics.ts        # Orchestrates all warning logic across open documents
├── extension.ts          # Entry point – activates the extension and registers listeners
```

The key architectural split is between `core/` and the rest. Everything inside `core/` is plain TypeScript with no dependency on VS Code — it can be tested in isolation without a VS Code runtime. Everything outside `core/` is responsible for wiring the logic into VS Code.

---

## Module responsibilities

### `extension.ts`

The entry point. Responsible for:

- Creating the single `DiagnosticCollection` instance
- Registering VS Code event listeners (`onDidOpenTextDocument`, `onDidChangeTextDocument` etc.)
- Calling `refreshAllDiagnostics()` on each event
- Disposing everything cleanly via `context.subscriptions`

This module contains no business logic — it only wires things together.

---

### `diagnostics.ts`

The orchestrator. Responsible for:

- Clearing and rebuilding all diagnostics on each refresh
- Running Pass 1 (missing keys in source files)
- Running Pass 2 (unused keys in `.env` files)
- Producing `vscode.Diagnostic` objects with correct range, message, and severity

This is the only module that imports from `vscode` apart from `extension.ts`.

---

### `core/commentDetector.ts`

A pure function module. Responsible for:

- Detecting if a given index in source text is inside a comment
- Supporting single-line comments (`//`) and multi-line comments (`/* */`)
- Returning a boolean indicating whether the index is commented out

No side effects, no VS Code dependency — fully unit testable.

---

### `core/constants.ts`

A constants module. Responsible for:

- Defining constant values used across the core modules
- Centralising regex patterns for environment variable detection
- Ensuring consistency and avoiding magic strings

No side effects, no VS Code dependency.

---

### `core/scanner.ts`

A pure function module. Responsible for:

- Matching environment variable patterns in raw source text
- Supporting dot notation and bracket notation
- Returning an array of `{ key, index }` objects

No side effects, no VS Code dependency — fully unit testable.

---

### `core/envParser.ts`

A pure function module. Responsible for:

- Reading a `.env` file from disk
- Ignoring comments and empty lines
- Returning a `Set<string>` of key names

No side effects, no VS Code dependency — fully unit testable.

---

### `core/fileWalker.ts`

A pure function module. Responsible for:

- Starting at the directory of a given file
- Walking up the tree until a `.env` file is found
- Returning `null` if none is found before the filesystem root

This is what enables monorepo support with zero configuration.

---

## Design principles

**Isolate VS Code.** Only `extension.ts` and `diagnostics.ts` import from `vscode`. Everything in `core/` is plain TypeScript that works in any environment — making it easy to test, reuse, and reason about independently.

**No configuration.** The extension works out of the box. Decisions like "find the nearest `.env`" are made automatically so the user never has to think about setup.
