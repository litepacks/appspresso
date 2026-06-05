# Configuration (minimal)

Single file: `appspresso.config.ts` using `defineAppspressoProject`.

## Required for most apps

```ts
app: {
  id: "com.example.myapp",
  displayName: "My App",
  version: "1.0.0",
  icon: "public/icon.svg",
}
```

## Splash (web bootstrap)

```ts
splash: {
  backgroundColor: "#0f172a",
  webBootstrapMinDurationMs: 600,
  webExitDurationMs: 400,
  webPublicPath: "/splash.svg",
  webAnimation: "none",
}
```

## Capacitor block

```ts
capacitor: {
  webDir: "dist",
  android: { path: "android" },
  ios: { path: "ios" },
},
```

## Optional features

Copy snippets from playbooks only when needed:

- Auth — [guides/auth.md](./auth.md)
- RevenueCat — [playbooks/revenuecat.md](../playbooks/revenuecat.md)
- Feature flags — `VITE_FEATURE_FLAGS` in `.env`
- Background runner / filesystem — see showcase `appspresso.config.ts` or playbooks

Keep config small; add plugins when you use them.
