/**
 * Register Appspresso runtime plugins.
 * @example
 * import { sentryPlugin } from "@appspresso/plugin-sentry";
 * export const plugins = [sentryPlugin({ dsn: import.meta.env.VITE_SENTRY_DSN })];
 */
export const plugins =
  [] as import("appspresso/plugin").ResolvedAppspressoPlugin[];
