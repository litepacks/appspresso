import { sentryPlugin } from "@appspresso/plugin-sentry";

/** Runtime plugins — listed by `appspresso doctor` when declared in package.json. */
export const plugins = [
  sentryPlugin({
    enabled: Boolean(import.meta.env.VITE_SENTRY_DSN),
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  }),
];
