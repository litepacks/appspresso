import { useTranslation } from "react-i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { isAuthLoginPath } from "@/lib/is-auth-path";

/**
 * When signed in, redirects other `/auth/*` routes to the main app,
 * except `/auth/login` — sign-in form / “already signed in” copy may show.
 */
export function AuthEntry() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { status } = useAuth();

  if (status === "signedIn" && !isAuthLoginPath(pathname)) {
    return <Navigate to="/" replace />;
  }

  if (status === "loading") {
    return (
      <div className="app-shell safe-top flex min-h-dvh items-center justify-center px-4 text-muted-foreground text-sm">
        {t("app.loading")}
      </div>
    );
  }

  return <Outlet />;
}
