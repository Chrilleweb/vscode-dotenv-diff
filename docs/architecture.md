# Architecture

This document explains how `vscode-dotenv-diff` is structured, how the modules relate to each other, and the reasoning behind key design decisions.

---

## Project structure

```
src/
├── core/                 # Pure logic – no VS Code dependency
│   ├── scanner.ts        # Finds process.env.KEY references in source code
│   ├── envParser.ts      # Reads and parses .env files into a Set of keys
│   └── fileWalker.ts     # Finds the nearest .env by walking up the directory tree
├── diagnostics.ts        # Orchestrates all warning logic across open documents
├── extension.ts          # Entry point – activates the extension and registers listeners
└── test/
    ├── core/
    │   ├── scanner.test.ts
    │   ├── envParser.test.ts
    │   └── fileWalker.test.ts
    └── diagnostics.test.ts
```

The key architectural split is between `core/` and the rest. Everything inside `core/` is plain TypeScript with no dependency on VS Code — it can be tested in isolation without a VS Code runtime. Everything outside `core/` is responsible for wiring the logic into VS Code.

---

## Data flow

The extension follows a simple linear flow every time a document event occurs:

```
VS Code event (open / edit / save / close)
        │
        ▼
  extension.ts
  refreshAllDiagnostics()
        │
        ├─── For each open .ts/.js file:
        │         │
        │         ├── core/fileWalker.ts → findNearestEnv()
        │         │         └── Returns path to nearest .env
        │         │
        │         ├── core/envParser.ts → parseEnvKeys()
        │         │         └── Returns Set<string> of defined keys
        │         │
        │         ├── core/scanner.ts → scanForEnvUsages()
        │         │         └── Returns EnvUsage[] of all process.env.KEY references
        │         │
        │         └── diagnostics.ts → produces warnings for missing keys
        │
        └─── For each open .env file:
                  │
                  ├── core/scanner.ts → scanForEnvUsages() (across all open source files)
                  │         └── Builds Set<string> of all used keys
                  │
                  └── diagnostics.ts → produces warnings for unused keys
```

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

### `core/scanner.ts`
A pure function module. Responsible for:
- Matching `process.env.KEY` patterns in raw source text
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

**Scan only open documents.** Rather than crawling the entire workspace, the extension only looks at what is currently open. This keeps performance predictable regardless of project size.

**No configuration.** The extension works out of the box. Decisions like "find the nearest `.env`" are made automatically so the user never has to think about setup.

**Refresh everything on each event.** Rather than trying to diff what changed, we clear and rebuild all diagnostics on every document event. For the scope of open documents only, this is fast enough and keeps the logic simple and correct.