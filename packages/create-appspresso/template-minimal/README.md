# %%DISPLAY_NAME%%

Minimal Appspresso host app — one screen, short config, ready for your routes and features.

## Quick start

```bash
cp .env.example .env   # optional: API URL, debug panel
npm install
npm run dev
```

## Project map

| File | Role |
|------|------|
| [`src/main.tsx`](src/main.tsx) | `bootAppspressoHost` + `HostAppFrame` entry |
| [`src/AppRoot.tsx`](src/AppRoot.tsx) | Your router (add routes here) |
| [`src/pages/HomePage.tsx`](src/pages/HomePage.tsx) | Starter home screen |
| [`appspresso.config.ts`](appspresso.config.ts) | Vite + app meta (id, splash, theme) |

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production web build
npm run preview   # Preview dist/
appspresso doctor # Environment check
appspresso info   # Project summary
```

## Showcase template

For the full vocabulary demo (offline sync, i18n, playground):

```bash
npm create appspresso@latest my-showcase -- --template showcase
```

## Docs

- [Getting started](https://github.com/appspresso/app-kit/blob/main/docs/getting-started/01-create-app.md)
- [Project layout](https://github.com/appspresso/app-kit/blob/main/docs/guides/project-layout.md)
