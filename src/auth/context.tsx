import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthAdapter } from "@/auth/adapter";
import { createDemoAuthAdapter } from "@/auth/adapters/demo";
import { setAuthPluginSnapshot } from "@/auth/plugin-bridge";
import { hydrateTokensFromStorage } from "@/auth/session-store";
import type { AuthStatus, AuthUser } from "@/auth/types";

export type AuthCtx = {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
  /** When omitted, demo adapter (local token + demo user). */
  adapter?: AuthAdapter;
};

export function AuthProvider({
  children,
  adapter: adapterProp,
}: AuthProviderProps) {
  const adapter = useMemo(
    () => adapterProp ?? createDemoAuthAdapter(),
    [adapterProp],
  );

  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    void hydrateTokensFromStorage();
    return adapter.subscribe(({ user: u, status: s }) => {
      setUser(u);
      setStatus(s);
      setAuthPluginSnapshot({ user: u, status: s });
    });
  }, [adapter]);

  const signIn = useCallback(() => adapter.signIn(), [adapter]);
  const signOut = useCallback(() => adapter.signOut(), [adapter]);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      status,
      signIn,
      signOut,
    }),
    [user, status, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export type { AuthAdapter } from "@/auth/adapter";
