# Security (Foundation)

## Client environment (`VITE_*`)

Only variables prefixed with `VITE_` are embedded in the browser bundle. **Never** place private API keys, signing secrets, or refresh tokens in `VITE_*`.

Public SDK keys (e.g. RevenueCat platform keys) are acceptable when documented as client-visible.

## Access tokens

| Platform | Storage | Notes |
|----------|---------|--------|
| Web | `sessionStorage` (prefixed keys) | Cleared when the tab session ends; vulnerable to XSS — keep CSP tight, avoid storing long-lived secrets |
| Native | `@aparajita/capacitor-secure-storage` | Preferred; on plugin failure an in-memory fallback is used and reported via `reportError` |

Firebase and Supabase adapters sync tokens into `session-store` for `api/http` Bearer auth.

## Local data

- **Sync outbox (web):** `localStorage` — do not queue sensitive payloads; validate on the server.
- **SQLite (native):** default config is **not encrypted**; enable encryption in a future host-specific migration if you store PII.

## Feature flags URL

`VITE_FEATURE_FLAGS_URL` fetches JSON over HTTPS with `credentials: "omit"`. Treat as **non-secret** toggles only; not licensing or entitlements.

## Dependency audit

CI runs `npm run audit:ci` (`npm audit --audit-level=high`). Fix or document exceptions before merging.

## Host checklist

1. Replace demo auth adapter in production.
2. Keep secrets on the server; use short-lived access tokens in the client.
3. Review [playbooks](./playbooks/) for offline/sync payload content.
4. Run `appspresso doctor` before shipping native builds.
