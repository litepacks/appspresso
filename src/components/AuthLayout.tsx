import { Outlet } from "react-router-dom";
import { OutletErrorBoundary } from "@/components/OutletErrorBoundary";

/** Sign-in / sign-up screens — no bottom tabs or top bar; same shell pattern as onboarding. */
export function AuthLayout() {
  return (
    <div className="app-shell safe-top flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md py-8">
        <OutletErrorBoundary>
          <Outlet />
        </OutletErrorBoundary>
      </div>
    </div>
  );
}
