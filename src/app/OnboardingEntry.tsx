import { useAtom } from "jotai";
import { Navigate, Outlet } from "react-router-dom";
import { hasCompletedOnboardingAtom } from "@/state/atoms";

/** Prevents re-entering onboarding when already completed. */
export function OnboardingEntry() {
  const [done] = useAtom(hasCompletedOnboardingAtom);
  if (done) return <Navigate to="/" replace />;
  return <Outlet />;
}
