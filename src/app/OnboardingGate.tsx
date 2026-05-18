import { useAtom } from "jotai";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthPath } from "@/lib/is-auth-path";
import { hasCompletedOnboardingAtom } from "@/state/atoms";

export function OnboardingGate() {
  const [done] = useAtom(hasCompletedOnboardingAtom);
  const loc = useLocation();

  if (!done && loc.pathname !== "/onboarding" && !isAuthPath(loc.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }

  if (done && loc.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
