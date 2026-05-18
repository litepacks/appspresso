import type { AuthStatus, AuthUser } from "./types";

export type AuthSnapshot = {
  user: AuthUser | null;
  status: AuthStatus;
};

export type AuthListener = (snapshot: AuthSnapshot) => void;

/**
 * External session provider (Firebase, Supabase, REST, …).
 * `subscribe` emits current state on first register; `signIn` / `signOut` called from core context.
 */
export type AuthAdapter = {
  subscribe: (listener: AuthListener) => () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};
