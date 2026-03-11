# Architecture

This document explains how `vscode-dotenv-diff` is structured, how the modules relate to each other, and the reasoning behind key design decisions.

---

## Project structure

```
src/
├── core/                 # Pure logic – no VS Code dependency
├── test/                 # Pure logic tests – no VS Code dependency
├── completionProvider.ts # .env autocomplete provider for missing keys
├── diagnostics.ts        # Orchestrates all warning logic across open documents
├── extension.ts          # Entry point – activates the extension and registers listeners
```

The key architectural split is between `core/` and the rest. Everything inside `core/` is plain TypeScript with no dependency on VS Code — it can be tested in isolation without a VS Code runtime. Everything outside `core/` is responsible for wiring the logic into VS Code.

---

## Design principles

**Isolate VS Code.** Only `extension.ts` and `diagnostics.ts` import from `vscode`. Everything in `core/` is plain TypeScript that works in any environment — making it easy to test, reuse, and reason about independently.

**No configuration.** The extension works out of the box. Decisions like "find the nearest `.env`" are made automatically so the user never has to think about setup.

---

## Runtime flow

1. `extension.ts` loads source files into an in-memory map and keeps it updated from editor/workspace events.
2. `diagnostics.ts` reuses the same map to compute missing/unused variable warnings.
3. `completionProvider.ts` uses the same workspace map and suggests missing `.env` keys in real time.
4. On empty lines in `.env`, `extension.ts` auto-triggers the suggestion UI only when missing keys exist.

This keeps diagnostics and autocomplete consistent because both are driven by the same scanned workspace state.

---

## Core modules used by autocomplete

- `core/scanner.ts` extracts env usages from source files.
- `core/envParser.ts` parses currently defined keys from `.env` content.
- `core/missingEnvKeys.ts` computes `used - defined` in a deterministic, sorted way.
