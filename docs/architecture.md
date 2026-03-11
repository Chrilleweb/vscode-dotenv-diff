# Architecture

This document explains how `vscode-dotenv-diff` is structured, how the modules relate to each other, and the reasoning behind key design decisions.

---

## Project structure

```
src/
├── core/                 # Pure logic – no VS Code dependency
├── test/                 # Pure logic tests – no VS Code dependency
├── completionProvider.ts # .env autocomplete provider for missing keys
├── diagnostics.ts        # Warning logic across open documents
├── extension.ts          # Entry point – activates the extension and registers listeners
```

The key architectural split is between `core/` and the rest. Everything inside `core/` is plain TypeScript with no dependency on VS Code — it can be tested in isolation without a VS Code runtime. Everything outside `core/` is responsible for wiring the logic into VS Code.

---

## Design principles

 Everything in `core/` is plain TypeScript that works in any environment — making it easy to test, reuse, and reason about independently.

**No configuration.** The extension works out of the box. Decisions like "find the nearest `.env`" are made automatically so the user never has to think about setup.
