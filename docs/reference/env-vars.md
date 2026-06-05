# Environment variables

Only `VITE_*` keys are exposed to the client.

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Axios base URL |
| `VITE_ENABLE_DEBUG_PANEL` | `"false"` hides debug panel in dev; empty = visible |
| `VITE_FEATURE_FLAGS` | JSON `{"key":true}` |
| `VITE_FEATURE_FLAGS_URL` | HTTPS JSON override |
| `VITE_SENTRY_DSN` | Optional error reporting |
| `VITE_GIT_SHA` | Build metadata |
| `VITE_REVENUECAT_API_KEY_IOS` | Public RC key (iOS) |
| `VITE_REVENUECAT_API_KEY_ANDROID` | Public RC key (Android) |

Never put secrets (API signing keys, refresh tokens for server-only use) in `VITE_*`.

See [docs/security.md](../security.md).
