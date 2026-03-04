# Capabilities

This document describes everything `vscode-dotenv-diff` can do, and how it behaves in different scenarios.

---

## 1. Missing environment variables

When a `.ts` or `.js` file references an environment variable and that key is not present in the nearest `.env` file, the extension underlines the reference with a warning.

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

## 3. Missing variables from `.env.example`

Keys in `.env.example` are also checked against the nearest `.env`.
If a key from `.env.example` does not exist in `.env`, it is flagged with a warning.

![Unused in .env.example](./screenshots/unused-example.png)

![Unused in .env from example](./screenshots/unused-example-env.png)

**Example:**

`.env.example`
```
API_KEY=
API_URL=
```

`.env`
```
API_URL=https://example.com
```

**Warning message:**
```
Environment variable "API_KEY" is defined in .env.example but missing in .env
```

**Example 2:**

`.env.example`
```
API_KEY=
```

But `API_KEY` is never referenced in any source file.

**Warning message:**
```
Environment variable "API_KEY" is defined in .env.example but never used
```

---

## 4. Monorepo support

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

## 5. Supported syntax

The extension recognises the following patterns:

```typescript
process.env.MY_KEY          // dot notation
process.env["MY_KEY"]       // bracket notation, double quotes
process.env['MY_KEY']       // bracket notation, single quotes
import.meta.env.MY_KEY       // dot notation
import.meta.env["MY_KEY"]    // bracket notation, double quotes
import.meta.env['MY_KEY']    // bracket notation, single quotes
env.PUBLIC_API_URL; // SvelteKit $env usage
```

Only `UPPER_CASE` key names are matched, which is the standard convention for environment variables.

---

## 6. Skipped files

The extension intentionally skips:

- `node_modules/**`
- Test files (`.test.ts`, `.spec.ts` etc.)

---

## Known limitations

- `.env.local`, `.env.production` etc. are not resolved — only `.env`