# Capabilities

This document describes everything `vscode-dotenv-diff` can do, and how it behaves in different scenarios.

---

## 1. Missing environment variables

When a `.ts` or `.js` file references `process.env.KEY` and that key is not present in the nearest `.env` file, the extension underlines the reference with a warning.

> Note: This only applies for `process.env` references, not for other usages of environment variables (e.g.`import.meta.env`).

**Example:**

`apps/frontend/.env`
```
DB_HOST=localhost
DB_PORT=5432
```

`apps/frontend/src/app.ts`
```typescript
const host = process.env.DB_HOST;     // defined in .env
const secret = process.env.SECRET;    // not defined in .env
```

**Warning message:**
```
Environment variable "SECRET" is not defined in .env
```

---

## 2. Unused environment variables

When a key is defined in a `.env` file but never referenced anywhere in the workspace, the key is flagged with a warning directly on that line in the `.env` file.

> Note: This only applies for `process.env` references, not for other usages of environment variables (e.g.`import.meta.env`).

**Example:**

`.env`
```
DB_HOST=localhost      # used in open source files
LEGACY_TOKEN=abc123    # not used anywhere
```

**Warning message:**
```
Environment variable "LEGACY_TOKEN" is defined but never used
```

---

## 3. Monorepo support

The extension automatically finds the nearest `.env` file by walking up the directory tree from the source file. No configuration required.

**Example structure:**
```
apps/
├── frontend/
│   ├── .env              ← used for frontend source files
│   └── src/
│       └── app.ts
├── backend/
│   ├── .env              ← used for backend source files
│   └── src/
│       └── server.ts
└── .env                  ← fallback if no closer .env exists
```

Each source file always resolves to its nearest `.env` — independently of other files.

---

## 4. Supported syntax

The extension recognises the following patterns:

```typescript
process.env.MY_KEY          // dot notation
process.env["MY_KEY"]       // bracket notation, double quotes
process.env['MY_KEY']       // bracket notation, single quotes
```

Only `UPPER_CASE` key names are matched, which is the standard convention for environment variables.

---

## 5. Full workspace scanning

On startup the extension scans all `.ts` and `.js` files in your workspace. This means unused `.env` keys are detected correctly from the moment you open VS Code, without needing to open every file manually.

Test files (`.test.ts`, `.spec.ts` etc.) are intentionally skipped.

---

## Known limitations

- Dynamic key access like `` process.env[`key_${name}`] `` is not supported
- Only `UPPER_CASE` keys are matched
- `.env.local`, `.env.production` etc. are not resolved — only `.env`