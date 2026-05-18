import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { AuthAdapter, AuthListener } from "@/auth/adapter";
import type { AuthUser } from "@/auth/types";

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
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(mapSession(session));
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
    },
  };
}
