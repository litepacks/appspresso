import type { AuthAdapter, AuthListener } from "@/auth/adapter";
import {
  clearSession,
  hydrateTokensFromStorage,
  setAccessToken as persistAccess,
} from "@/auth/session-store";
import type { AuthStatus, AuthUser } from "@/auth/types";

/**
 * Template default: demo token in secure storage, local demo user.
 * Replace with `createFirebaseAuthAdapter` etc. in production.
 */
export function createDemoAuthAdapter(): AuthAdapter {
  let user: AuthUser | null = null;
  let status: AuthStatus = "loading";
  const listeners = new Set<AuthListener>();
  let hydratePromise: Promise<void> | null = null;

  const emit = () => {
    const snap = { user, status } as const;
    for (const l of listeners) l(snap);
  };

  function ensureHydrated(): Promise<void> {
    if (!hydratePromise) {
      hydratePromise = (async () => {
        await hydrateTokensFromStorage();
        user = null;
        status = "signedOut";
        emit();
      })();
    }
    return hydratePromise;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      void ensureHydrated().then(() => listener({ user, status }));
      return () => {
        listeners.delete(listener);
      };
    },
    async signIn() {
      await ensureHydrated();
      status = "loading";
      emit();
      await persistAccess("demo-token");
      user = { id: "demo", name: "Demo user" };
      status = "signedIn";
      emit();
    },
    async signOut() {
      await ensureHydrated();
      await clearSession();
      user = null;
      status = "signedOut";
      emit();
    },
  };
}
