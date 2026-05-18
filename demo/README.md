# Demo (in-repo starter)

This folder mirrors the app that **`npm create appspresso`** scaffolds. It uses `"appspresso": "file:.."` so you can iterate against the library source.

The in-repo demo is a small **word-practice** flow (home, study flashcards, word list, more). See repo root `README` for full library documentation.

- Run from repo root: `npm run demo:dev`
- **Public assets:** for `public/` files use `publicAssetUrl("icon.svg")` — `appspresso/lib/public-asset` (images under `src/` via `import` are separate).
- Refresh the published template after editing: `npm run create:sync-template`
