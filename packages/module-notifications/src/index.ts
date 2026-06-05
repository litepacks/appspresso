import { defineModule } from "appspresso/module";
import { z } from "zod";

const migration003 = {
  version: 3,
  statements: `
CREATE TABLE IF NOT EXISTS appspresso_notifications (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  received_at TEXT NOT NULL,
  deep_link TEXT
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON appspresso_notifications(read, received_at);
`.trim(),
};

const configSchema = z.object({
  listPath: z.string().default("notifications"),
  detailPath: z.string().default("notifications/detail"),
});

export type NotificationsModuleConfig = z.infer<typeof configSchema>;

export const notificationsModule = defineModule({
  name: "notifications",
  version: "0.6.0",
  configSchema,
  migrations: [migration003],
  appRoutes: (config) => [
    {
      path: config.listPath,
      handle: {
        titleKey: "nav.notifications",
        tabId: "notifications",
        tabIcon: "notifications",
        showTabBar: true,
        layout: "main",
      },
      load: () => import("appspresso/pages/Notifications"),
    },
    {
      path: config.detailPath,
      handle: {
        titleKey: "notifications.detailTitle",
        showTabBar: false,
        layout: "main",
      },
      load: () => import("appspresso/pages/NotificationDetail"),
    },
  ],
  async onBootstrap(ctx) {
    ctx.logger.debug("notifications: bootstrap");
  },
});
