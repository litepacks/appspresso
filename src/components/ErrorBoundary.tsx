import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import i18n from "@/i18n";
import { reportError } from "@/lib/reportError";

export type ErrorBoundaryFallbackRender = (args: {
  error: Error;
  reset: () => void;
}) => ReactNode;

export type ErrorBoundaryProps = {
  children: ReactNode;
  /**
   * `full`: full screen (for root boundary).
   * `inline`: card inside page body; top bar / tabs stay in `Layout`.
   */
  variant?: "full" | "inline";
  /** Resets error when route or external state changes (e.g. `[pathname, search]`). */
  resetKeys?: ReadonlyArray<string | number | boolean | null | undefined>;
  fallback?: ErrorBoundaryFallbackRender;
};

type State = { error: Error | null };

function keysChanged(
  a: ErrorBoundaryProps["resetKeys"],
  b: ErrorBoundaryProps["resetKeys"],
): boolean {
  if (!a?.length) {
    return false;
  }
  if (!b || a.length !== b.length) {
    return true;
  }
  return a.some((k, i) => k !== b[i]);
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      kind: "react.errorBoundary",
      componentStack: info.componentStack,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error &&
      keysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.setState({ error: null });
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    const { fallback, variant = "full" } = this.props;
    if (fallback) {
      return fallback({ error, reset: this.reset });
    }

    const tryAgainLabel = i18n.t("errorBoundary.tryAgain");
    const reloadLabel = i18n.t("errorBoundary.reloadApp");

    if (variant === "inline") {
      return (
        <div
          className="flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/30 p-6 text-center"
          role="alert"
        >
          <h2 className="text-base font-semibold">
            {i18n.t("errorBoundary.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {i18n.t("errorBoundary.description")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button type="button" onClick={this.reset}>
              {tryAgainLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.reload();
              }}
            >
              {reloadLabel}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="app-shell flex flex-col items-center justify-center gap-4 p-6 text-center"
        role="alert"
      >
        <h1 className="text-lg font-semibold">
          {i18n.t("errorBoundary.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {i18n.t("errorBoundary.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={this.reset}>
            {tryAgainLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
          >
            {reloadLabel}
          </Button>
        </div>
      </div>
    );
  }
}
