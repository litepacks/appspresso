import { definePlugin } from "appspresso/plugin";
import { z } from "zod";

const configSchema = z.object({
  apiKey: z.string().min(1),
  apiHost: z.string().url().optional(),
  enabled: z.boolean().optional(),
});

export type PostHogPluginConfig = z.infer<typeof configSchema>;

async function loadPostHog() {
  try {
    return await import("posthog-js");
  } catch {
    return null;
  }
}

export const posthogPlugin = definePlugin({
  name: "@appspresso/plugin-posthog",
  version: "0.3.0",
  configSchema,
  optionalPeers: ["auth"],
  platforms: ["web", "native"],
  setup(ctx, config) {
    if (config.enabled === false) return;
    ctx.registerAnalytics({
      track(event, properties) {
        void loadPostHog().then((mod) => {
          mod?.default.capture(event, properties);
        });
      },
      identify(userId, traits) {
        void loadPostHog().then((mod) => {
          mod?.default.identify(userId, traits);
        });
      },
      reset() {
        void loadPostHog().then((mod) => {
          mod?.default.reset();
        });
      },
    });
  },
  async onBootstrap(ctx, config) {
    if (config.enabled === false) return;
    const mod = await loadPostHog();
    if (!mod) {
      ctx.logger.warn("posthog: install posthog-js to enable analytics");
      return;
    }
    mod.default.init(config.apiKey, {
      api_host: config.apiHost ?? "https://app.posthog.com",
    });
    ctx.logger.info("posthog: initialized");
  },
  async onAppReady(ctx) {
    const user = ctx.auth?.getSnapshot().user;
    if (!user) return;
    const mod = await loadPostHog();
    mod?.default.identify(user.id, { email: user.email, name: user.name });
  },
});
