import { Outlet } from "react-router-dom";
import { OutletErrorBoundary } from "@/components/OutletErrorBoundary";

export function OnboardingLayout() {
  return (
    <div className="app-shell safe-top flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md py-8">
        <OutletErrorBoundary>
          <Outlet />
        </OutletErrorBoundary>
      </div>
    </div>
  );
}
