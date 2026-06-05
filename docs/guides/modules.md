# Appspresso app modules

Modules add **user-facing app features** (auth screens, settings, onboarding). They are not plugins.

| | Plugin | Module |
|---|--------|--------|
| Purpose | SDK / telemetry / session bridge | Routes, screens, hooks |
| Config | `src/appspresso.plugins.ts` | `src/appspresso.modules.ts` |

## Install

```bash
appspresso add auth
appspresso add settings
```

Then wire modules in `main.tsx`:

```tsx
import { AppspressoHost } from "appspresso/app/AppspressoHost";
import { createModuleRegistry } from "appspresso/module";
import { createAppspressoBrowserRouter, RouterProvider } from "appspresso/app/router";
import { modules } from "./appspresso.modules";

const registry = createModuleRegistry(modules);

<AppspressoHost modules={modules} plugins={plugins}>
  <RouterProvider
    router={createAppspressoBrowserRouter({
      modules: registry,
      legacyShowcase: false,
    })}
  />
</AppspressoHost>
```

## Customize without forking

```ts
import { authModule } from "@appspresso/module-auth";
import { MyLogin } from "./screens/MyLogin";

authModule({
  basePath: "/auth",
  screens: { Login: MyLogin },
  enableRegister: false,
});
```

## CLI

- `appspresso add <name>` — install package + update `appspresso.modules.ts`
- `appspresso remove <name>`
- `appspresso module list`
- `appspresso module doctor`
- `appspresso module info auth`

## Official modules (v0.6)

- `@appspresso/module-onboarding`
- `@appspresso/module-auth`
- `@appspresso/module-settings`
- `@appspresso/module-notifications`
- `@appspresso/module-subscriptions`

See [modules vs plugins](../architecture/modules-vs-plugins.md).
