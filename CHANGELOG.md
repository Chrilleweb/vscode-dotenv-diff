# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

- "You miss 100 percent of the chances you don't take. — Wayne Gretzky" — Michael Scott

## [0.5.0](https://github.com/Chrilleweb/vscode-dotenv-diff/compare/v0.4.0...v0.5.0) (2026-02-23)

### ✨ Features

* support destructuring env ([#15](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/15)) ([645413d](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/645413dd88e1ddc4e280be6e59a08ade6aa59ebc))

### 🐛 Bug Fixes

* import meta env bracket notation ([#13](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/13)) ([041d564](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/041d5648aee970c8471b3b0189f95560493f1550))

### 📝 Documentation

* updated capabilities ([#14](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/14)) ([58bbccc](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/58bbccc4e1db48f4678c701fd097ef3bf1dc6a8b))

## [0.4.0](https://github.com/Chrilleweb/vscode-dotenv-diff/compare/v0.3.0...v0.4.0) (2026-02-22)

### ✨ Features

* sveltekit env support ([#9](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/9)) ([d40f505](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/d40f505ff0c2e279507c8011169a1c9787075633))

## [0.3.0](https://github.com/Chrilleweb/vscode-dotenv-diff/compare/v0.2.1...v0.3.0) (2026-02-22)

### ✨ Features

* support for import.meta.env ([#6](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/6)) ([ec36e6b](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/ec36e6b67d92c799c3c0fcf2266b8460a75c780d))

### 📝 Documentation

* updated docs ([#7](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/7)) ([7d63018](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/7d6301828df4d2c1272c3c6b1b434f976061f329))

## [0.2.1](https://github.com/Chrilleweb/vscode-dotenv-diff/compare/v0.2.0...v0.2.1) (2026-02-22)

### 🐛 Bug Fixes

* skip comments bug - ignore test files ([#2](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/2)) ([369ec43](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/369ec4392c839473e040ab91606de85e5f06f83e))

### 📝 Documentation

* minor changes on readme ([#4](https://github.com/Chrilleweb/vscode-dotenv-diff/issues/4)) ([a684bd8](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/a684bd857f78afb0d4866e6b0d22aac7cf4e2354))

## 0.2.0 (2026-02-21)

### ✨ Features

* ignore comments ([fccdbe1](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/fccdbe12c186e9f6a72cad7cd39e01af67fd775c))

### 📝 Documentation

* documentation ([7d71127](https://github.com/Chrilleweb/vscode-dotenv-diff/commit/7d71127cc646593cde0a5b260a925ba13af8a0dd))

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
