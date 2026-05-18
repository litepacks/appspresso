import { getEnvConfig } from "@/config/env";
import { logger } from "@/lib/logger";

function serializeUnknown(error: unknown): string {
  if (error instanceof Error) return error.stack ?? error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function initTelemetry(): void {
  const env = getEnvConfig();
  if (env.sentryDsn) {
    logger.info("telemetry: Sentry DSN configured (native init in README)");
  }
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  logger.error("captureException", {
    error: serializeUnknown(error),
    ...context,
  });
}

export function captureMessage(
  _level: "info" | "warning" | "error",
  message: string,
  context?: Record<string, unknown>,
): void {
  logger.info(`telemetry: ${message}`, context);
}
