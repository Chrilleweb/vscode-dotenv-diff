# Changelog

All notable changes to **vscode-dotenv-diff** will be documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] – 2026-02-21

### Added
- Warning when `process.env.KEY` is used in `.ts`/`.js` but not defined in nearest `.env`
- Warning when a key in `.env` is never referenced in any open source file
- Monorepo support via automatic walk-up to nearest `.env`
- Supports dot notation and bracket notation (`process.env.KEY`, `process.env["KEY"]`)
- Diagnostics update live on open, edit, save, and close