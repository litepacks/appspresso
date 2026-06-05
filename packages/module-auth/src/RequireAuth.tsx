import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type AuthStatus = "loading" | "signedIn" | "signedOut";

type RequireAuthProps = {
  children: ReactNode;
  status: AuthStatus;
  loginPath?: string;
};

/** Gate children when signed in; redirect to login when signed out. */
export function RequireAuth({
  children,
  status,
  loginPath = "/auth/login",
}: RequireAuthProps) {
  const loc = useLocation();
  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (status === "signedOut") {
    return <Navigate to={loginPath} replace state={{ from: loc.pathname }} />;
  }
  return <>{children}</>;
}
