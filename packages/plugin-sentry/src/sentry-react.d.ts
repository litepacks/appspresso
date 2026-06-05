declare module "@sentry/react" {
  export function init(options: Record<string, unknown>): void;
  export function captureException(
    error: unknown,
    context?: { extra?: Record<string, unknown> },
  ): void;
  export function setUser(user: { id?: string; email?: string }): void;
  export function close(): Promise<void>;
}
