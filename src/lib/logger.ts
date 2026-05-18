type Level = "debug" | "info" | "warn" | "error";

const dev = import.meta.env.DEV;

function log(level: Level, message: string, context?: Record<string, unknown>) {
  const prefix = `[${level}] ${message}`;
  if (level === "debug" && !dev) return;
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : level === "debug"
          ? console.debug
          : console.info;
  if (context && Object.keys(context).length > 0) fn(prefix, context);
  else fn(prefix);
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => log("debug", m, c),
  info: (m: string, c?: Record<string, unknown>) => log("info", m, c),
  warn: (m: string, c?: Record<string, unknown>) => log("warn", m, c),
  error: (m: string, c?: Record<string, unknown>) => log("error", m, c),
};
