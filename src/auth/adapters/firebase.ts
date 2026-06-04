import {
  type Auth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import type { AuthAdapter, AuthListener } from "@/auth/adapter";
import { syncHttpAccessToken } from "@/auth/token-bridge";
import type { AuthUser } from "@/auth/types";

function mapUser(u: User | null): AuthUser | null {
  if (!u) return null;
  return {
    id: u.uid,
    name: u.displayName ?? u.email ?? u.uid,
    email: u.email ?? undefined,
  };
}

/**
 * `firebase/auth` instance. `signIn` opens an anonymous session by default;
 * Use Firebase API from UI for email / OAuth; state updates via `subscribe`.
 */
export function createFirebaseAuthAdapter(auth: Auth): AuthAdapter {
  return {
    subscribe(listener: AuthListener) {
      const unsub = onAuthStateChanged(auth, (u) => {
        void (async () => {
          if (u) {
            const token = await u.getIdToken();
            await syncHttpAccessToken(token);
          } else {
            await syncHttpAccessToken(null);
          }
          listener({
            user: mapUser(u),
            status: u ? "signedIn" : "signedOut",
          });
        })();
      });
      return unsub;
    },
    async signIn() {
      await signInAnonymously(auth);
    },
    async signOut() {
      await firebaseSignOut(auth);
      await syncHttpAccessToken(null);
    },
  };
}
