# vscode-dotenv-diff – Documentation

Welcome to the official documentation for `vscode-dotenv-diff`, a VS Code extension that catches missing and unused environment variables (`process.env`) directly in your editor.

---

## What is vscode-dotenv-diff?

When building applications, it's easy to reference `process.env.MY_KEY` in your code but forget to define it in your `.env` file — or to leave stale keys in `.env` that are no longer used anywhere. Both problems are silent and hard to spot.

`vscode-dotenv-diff` solves this by analysing your open files and surfacing warnings exactly where the problem is, without any configuration.

---

## Documentation

| Document | Description |
|---|---|
| [Capabilities](./capabilities.md) | What the extension can do and how to use it |
| [Architecture](./architecture.md) | How the codebase is structured and why |

---

## Quick links

- [GitHub Repository](https://github.com/Chrilleweb/vscode-dotenv-diff)
- [Issue Tracker](https://github.com/Chrilleweb/vscode-dotenv-diff/issues)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Chrilleweb.dotenv-diff)
- [CHANGELOG](../CHANGELOG.md)