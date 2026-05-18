import { captureException } from "@/services/telemetry.service";

/**
 * App-wide error reporting contract — bridge to `telemetry.captureException`.
 * Window listeners and components use this; Sentry etc. stay in one place.
 */
export function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  captureException(error, { source: "reportError", ...context });
}
