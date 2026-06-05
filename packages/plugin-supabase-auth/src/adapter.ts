import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { AuthAdapter, AuthListener } from "appspresso/auth/adapter";
import { syncHttpAccessToken } from "appspresso/auth/token-bridge";
import type { AuthUser } from "appspresso/auth/types";

function mapSession(session: Session | null): {
  user: AuthUser | null;
  status: "signedOut" | "signedIn";
} {
  if (!session?.user) {
    return { user: null, status: "signedOut" };
  }
  const u = session.user;
  return {
    user: {
      id: u.id,
      name:
        (typeof u.user_metadata?.full_name === "string"
          ? u.user_metadata.full_name
          : undefined) ??
        u.email ??
        u.id,
      email: u.email ?? undefined,
    },
    status: "signedIn",
  };
}

/**
 * Supabase Auth. `signIn` is not called: use `client.auth.signInWithPassword`, `signInWithOAuth`, … in UI;
 * Session is propagated via `onAuthStateChange`.
 */
export function createSupabaseAuthAdapter(client: SupabaseClient): AuthAdapter {
  return {
    subscribe(listener: AuthListener) {
      void client.auth.getSession().then(({ data: { session } }) => {
        void syncHttpAccessToken(session?.access_token ?? null).then(() => {
          listener(mapSession(session));
        });
      });

      const { data } = client.auth.onAuthStateChange((_event, session) => {
        void syncHttpAccessToken(session?.access_token ?? null).then(() => {
          listener(mapSession(session));
        });
      });
      return () => {
        data.subscription.unsubscribe();
      };
    },
    async signIn() {
      throw new Error(
        "createSupabaseAuthAdapter: use client.auth.signInWithPassword, signInWithOAuth, etc. from your app. Session updates flow through subscribe().",
      );
    },
    async signOut() {
      await client.auth.signOut();
      await syncHttpAccessToken(null);
    },
  };
}
