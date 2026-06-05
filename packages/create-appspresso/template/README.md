# %%DISPLAY_NAME%%

**Showcase** Appspresso app — vocabulary demo with routing, Jotai, i18n, and kit playground cards.

For a smaller starter, use the minimal template: `npm create appspresso@latest my-app` (default).

## Quick start (web, ~10 minutes)

```bash
cp .env.example .env
npm install
npm run dev
```

## Project map

| File | Role |
|------|------|
| [`src/main.tsx`](src/main.tsx) | `bootAppspressoHost` entry |
| [`src/DemoShowcaseApp.tsx`](src/DemoShowcaseApp.tsx) | App shell + providers wiring |
| [`src/demo-router.tsx`](src/demo-router.tsx) | Routes and lazy pages |
| [`appspresso.config.ts`](appspresso.config.ts) | Vite, splash, native plugins, theme |

## Commands

```bash
npm run dev
npm run build
appspresso doctor
appspresso info
```

## Create again

```bash
npm create appspresso@latest %%PROJECT_NAME%% -- --template showcase
```
