# Create an app

## Web-first (recommended first run, ~10 minutes)

```bash
npm create appspresso@latest my-app
cd my-app
cp .env.example .env
npm run dev
```

Default template is **minimal** (one home screen, short config).

## Showcase (full demo)

```bash
npm create appspresso@latest my-showcase -- --template showcase
```

Includes vocabulary routes, i18n, and kit playground.

## With Capacitor (hybrid)

```bash
npm create appspresso@latest my-app -- --with-capacitor -y
```

Interactive init can offer `npx cap add android` / `ios` after install.

Then:

```bash
npm run build
npm run cap:sync
npm run cap:open:android
```

See [First native run](./03-first-run-native.md).

## Integrate into existing Vite app

```bash
cd your-vite-app
appspresso init . --package-name @acme/my-app -y
```

## CLI alias

```bash
appspresso create my-app
```

Same as `npm create appspresso@latest my-app`.
