# Appspresso Studio (v0.4)

Local dev-only UI for editing typed project configuration — no page codegen, no marketplace.

## Start Studio

From your app root (where `appspresso.config.ts` lives):

```bash
appspresso studio
```

Studio binds to `127.0.0.1` only (default port `5178`). Open the printed URL in your browser.

## What Studio edits

| Domain | File(s) |
|--------|---------|
| Routes | `appspresso.routes.ts` |
| Feature flags | `appspresso.flags.ts` |
| Theme tokens | `appspresso.theme.ts` |
| Environment | `appspresso.env.schema.ts`, `.env.example` |
| Plugins | `appspresso.plugins.ts` (installed plugins only) |
| Capacitor | `appspresso.config.ts` (`app` + `capacitor` slices; merged JSON is preview-only) |

Studio **never** writes `.env`, `.env.local`, `src/pages/**`, or `capacitor.config.json`.

## Validate (CI)

```bash
appspresso studio --check
appspresso studio --check --json
appspresso config validate
```

Exits non-zero when any domain fails validation or when secrets appear staged in git.

## Workflow

1. Edit a domain in Studio (or by hand in the slice files).
2. **Validate & Apply** — preview check, then save allowlisted files.
3. If Capacitor fields changed: `appspresso cap:config` then `appspresso native sync`.

## Feature flags runtime

Register defaults before bootstrap:

```typescript
import { flags } from "./appspresso.flags";
import { setFeatureFlagRegistry } from "appspresso/config";

setFeatureFlagRegistry(flags);
```

Merge order: registry defaults → `VITE_FEATURE_FLAGS` → optional remote URL.

## Related commands

- `appspresso doctor` — toolchain and dependency health
- `appspresso analyze` — bundle size report after `npm run build`
