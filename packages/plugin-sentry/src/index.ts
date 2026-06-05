import { definePlugin } from "appspresso/plugin";
import { z } from "zod";

const configSchema = z.object({
  dsn: z.string().url().optional(),
  environment: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type SentryPluginConfig = z.infer<typeof configSchema>;

async function loadSentry() {
  try {
    return await import("@sentry/react");
  } catch {
    return null;
  }
}

export const sentryPlugin = definePlugin({
  name: "@appspresso/plugin-sentry",
  version: "0.3.0",
  configSchema,
  optionalPeers: ["auth"],
  setup(ctx, config) {
    const enabled = config.enabled !== false;
    const dsn = config.dsn ?? ctx.env.sentryDsn;
    if (!enabled || !dsn) {
      ctx.logger.info("sentry: disabled (no DSN)");
      return;
    }
    ctx.registerErrorReporter((error, meta) => {
      void loadSentry().then((Sentry) => {
        if (!Sentry) return;
        Sentry.captureException(error, { extra: meta });
      });
    });
  },
  async onBootstrap(ctx, config) {
    const dsn = config.dsn ?? ctx.env.sentryDsn;
    if (!dsn || config.enabled === false) return;
    const Sentry = await loadSentry();
    if (!Sentry) {
      ctx.logger.warn(
        "sentry: install @sentry/react as a dependency to enable SDK init",
      );
      return;
    }
    Sentry.init({
      dsn,
      environment: config.environment,
    });
    ctx.logger.info("sentry: initialized");
  },
  async onAppReady(ctx) {
    const user = ctx.auth?.getSnapshot().user;
    if (!user) return;
    const Sentry = await loadSentry();
    if (!Sentry) return;
    Sentry.setUser({ id: user.id, email: user.email });
  },
  async dispose() {
    const Sentry = await loadSentry();
    if (Sentry) await Sentry.close?.();
  },
});
