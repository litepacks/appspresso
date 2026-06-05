# Appspresso runtime plugins

Runtime plugins extend bootstrap, providers, errors, and analytics. They are **not** Capacitor native plugins (`capacitor.plugins` in `appspresso.config.ts`).

## Quick start

1. Install a plugin:

```bash
npm install @appspresso/plugin-sentry
```

2. Register in `src/appspresso.plugins.ts`:

```ts
import { sentryPlugin } from "@appspresso/plugin-sentry";

export const plugins = [
  sentryPlugin({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  }),
];
```

3. Pass to `AppspressoHost` in `main.tsx`:

```tsx
import { AppspressoHost } from "appspresso/app/AppspressoHost";
import { plugins } from "./appspresso.plugins";

<AppspressoHost plugins={plugins}>
  {/* your routes */}
</AppspressoHost>
```

Run `appspresso doctor` to list `@appspresso/plugin-*` dependencies and `appspresso.plugins.ts`.

## Authoring a plugin

```ts
import { z } from "zod";
import { definePlugin } from "appspresso/plugin";

const schema = z.object({ apiKey: z.string() });

export const myPlugin = definePlugin({
  name: "@my-org/plugin-example",
  version: "1.0.0",
  configSchema: schema,
  requires: ["auth"],
  platforms: ["web", "native"],
  setup(ctx, config) {
    ctx.registerAnalytics({
      track: (event, props) => console.log(event, props),
    });
  },
  async onBootstrap(ctx, config) {
    ctx.mergeFeatureFlags({ myFeature: true });
  },
  onAppReady(ctx) {
    const user = ctx.auth?.getSnapshot().user;
  },
  dispose(ctx) {},
});
```

## Capabilities (`requires`)

| Token | Meaning |
|-------|---------|
| `auth` | `AuthProvider` not omitted |
| `platform:web` | Web only |
| `platform:native` | iOS/Android only |
| `sqlite` | SQLite status readable (read-only) |
| `sync` | Sync layer available |

Use `after: ["@appspresso/plugin-firebase-auth"]` to order relative to other plugins.

## Official packages

| Package | Purpose |
|---------|---------|
| `@appspresso/plugin-sentry` | Error reporting |
| `@appspresso/plugin-firebase-auth` | Firebase `AuthAdapter` |
| `@appspresso/plugin-supabase-auth` | Supabase `AuthAdapter` |
| `@appspresso/plugin-posthog` | Product analytics |
| `@appspresso/plugin-testing` | `createPluginTestRuntime()` for unit tests |

Auth adapters ship in both `appspresso/auth/adapters/*` (0.x) and `@appspresso/plugin-*-auth` (plugin-first). Use the same implementation; pick one import path per app.

## Example

See [examples/plugin-host](../../examples/plugin-host/).
