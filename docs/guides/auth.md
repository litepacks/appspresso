# Auth configuration

## Demo (default in showcase)

`createDemoAuthAdapter()` — local demo token.

## Production

Pass an adapter to `AuthProvider`:

```tsx
import { AuthProvider } from "appspresso/app/providers/AuthProvider";
import { createFirebaseAuthAdapter } from "appspresso/auth/adapters/firebase";
import { getAuth } from "firebase/auth";

<AuthProvider adapter={createFirebaseAuthAdapter(getAuth())}>
  {children}
</AuthProvider>
```

Firebase and Supabase adapters sync tokens to `session-store` so `appspresso/api/http` sends `Authorization: Bearer`.

## Custom REST auth

Implement `AuthAdapter` (`subscribe`, `signIn`, `signOut`) and call `syncHttpAccessToken` from `appspresso/auth/token-bridge` when your token changes.

See [docs/security.md](../security.md).
