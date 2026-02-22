# Capabilities

This document describes everything `vscode-dotenv-diff` can do, and how it behaves in different scenarios.

---

## 1. Missing environment variables

When a `.ts` or `.js` file references `process.env.KEY` and that key is not present in the nearest `.env` file, the extension underlines the reference with a warning.

![Not Defined](./screenshots/not-defined.png)

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

![Unused](./screenshots/unused.png)

**Example:**

`.env`
```
DB_HOST=
```

**Warning message:**
```
Environment variable "DB_HOST" is defined in .env but never used
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
import.meta.env.MY_KEY       // dot notation
import.meta.env["MY_KEY"]    // bracket notation, double quotes
import.meta.env['MY_KEY']    // bracket notation, single quotes
```

Only `UPPER_CASE` key names are matched, which is the standard convention for environment variables.

---

## 5. Skipped files

Test files (`.test.ts`, `.spec.ts` etc.) are intentionally skipped.

---

## Known limitations

- Dynamic key access like `` process.env[`key_${name}`] `` is not supported
- Only `UPPER_CASE` keys are matched
- `.env.local`, `.env.production` etc. are not resolved — only `.env`