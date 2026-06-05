import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import i18n from "@/i18n";
import { reportError } from "@/lib/reportError";

type Props = {
  children: ReactNode;
  /** Called when error is captured; use for telemetry/metrics. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  error: Error | null;
  errorCount: number;
};

/**
 * Top-level error boundary for catastrophic failures (bootstrap, root render).
 * Unlike ErrorBoundary, this has no reset capability — errors here likely
 * require reload or bugfix.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error, errorCount: 1 };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      kind: "react.globalErrorBoundary",
      componentStack: info.componentStack,
    });
    this.props.onError?.(error, info);
  }

  private reload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <h1 className="text-lg font-semibold">
          {i18n.t("errorBoundary.fatalTitle", "Something went wrong")}
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          {i18n.t(
            "errorBoundary.fatalDescription",
            "The app encountered a critical error. Please reload to try again.",
          )}
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="max-w-xs overflow-auto rounded border border-border bg-muted p-2 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="flex gap-2">
          <Button onClick={this.reload}>
            {i18n.t("errorBoundary.reloadApp", "Reload App")}
          </Button>
        </div>
      </div>
    );
  }
}
