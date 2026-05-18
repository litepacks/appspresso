import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export type OutletErrorBoundaryProps = {
  children: ReactNode;
};

/**
 * Resets boundary state when route (`pathname` / `search`) changes; on body error the top shell (e.g. `AppTopBar`) remains.
 */
export function OutletErrorBoundary({ children }: OutletErrorBoundaryProps) {
  const { pathname, search } = useLocation();
  return (
    <ErrorBoundary resetKeys={[pathname, search]} variant="inline">
      {children}
    </ErrorBoundary>
  );
}
