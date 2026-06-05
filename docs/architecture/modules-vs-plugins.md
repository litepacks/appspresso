# Modules vs plugins

## Plugins (infrastructure)

- Error reporting (Sentry)
- Analytics (PostHog)
- Auth **session** adapters (Firebase, Supabase)

Registered in `appspresso.plugins.ts`, lifecycle via `PluginRegistry`.

## Modules (application features)

- Onboarding wizard
- Auth **screens** (login, register, forgot)
- Settings (theme, language, about)
- Notification center
- Subscriptions / paywall

Registered in `appspresso.modules.ts`, routes merged by `createAppspressoBrowserRouter({ modules })`.

## Auth example

```ts
// Plugin — wires Firebase SDK to AuthAdapter
import { firebaseAuthPlugin } from "@appspresso/plugin-firebase-auth";

// Module — UI + routes
import { authModule } from "@appspresso/module-auth";

// Host
<AppspressoHost
  plugins={[firebaseAuthPlugin({ ... })]}
  modules={[authModule()]}
  authAdapter={createFirebaseAuthAdapter(...)}
/>
```

The module never replaces `AuthAdapter`; it consumes `useAuth()` from core.
