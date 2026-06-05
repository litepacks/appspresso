# First run (web)

After [creating the app](./01-create-app.md):

## 1. Environment

```bash
cp .env.example .env
```

Optional:

- `VITE_API_BASE_URL` — your API (Axios in `appspresso/api/http`)
- Leave `VITE_ENABLE_DEBUG_PANEL` empty to show the debug panel in dev

## 2. Dev server

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## 3. Debug panel

In development, a bug icon appears (bottom-right). It shows:

- Bootstrap phase
- Network / sync / SQLite status
- Actions to clear query cache or web outbox

## 4. Project summary

```bash
appspresso info --map
appspresso doctor
```

## 5. First edit

Minimal template:

- `src/pages/HomePage.tsx` — UI
- `src/AppRoot.tsx` — add routes

Use components from `appspresso/components/ui/*`.

Next: [guides/project-layout.md](../guides/project-layout.md) or [First native run](./03-first-run-native.md).
