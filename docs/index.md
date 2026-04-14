# [VS Code Dotenv-diff](https://marketplace.visualstudio.com/items?itemName=Chrilleweb.dotenv-diff) – Documentation

Welcome to the official documentation for `vscode-dotenv-diff`, a VS Code extension that autocompletes missing `.env` variables and catches missing/unused keys directly in your editor.

---

## What is vscode-dotenv-diff?

When building applications, it's easy to reference `process.env.MY_KEY` (Node.js), `import.meta.env.MY_KEY` (Vite), or `import { MY_KEY } from '$env/static/private'` (SvelteKit) in your code but forget to define it in your `.env` file — or to leave stale keys in `.env` that are no longer used anywhere. Both problems are silent and hard to spot.

`vscode-dotenv-diff` solves this by analysing your source files and surfacing warnings exactly where the problem is, without any configuration.

---

## Documentation

| Document | Description |
|---|---|
| [Capabilities](./capabilities.md) | Features and behavior (autocomplete, missing, unused, monorepo) |
| [Architecture](./architecture.md) | How the codebase is structured and why |

---

## Quick links

- [GitHub Repository](https://github.com/Chrilleweb/vscode-dotenv-diff)
- [Issue Tracker](https://github.com/Chrilleweb/vscode-dotenv-diff/issues)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Chrilleweb.dotenv-diff)
- [CHANGELOG](../CHANGELOG.md)