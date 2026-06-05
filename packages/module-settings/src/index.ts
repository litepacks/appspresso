import type { ComponentType } from "react";
import { defineModule } from "appspresso/module";
import { z } from "zod";

const configSchema = z.object({
  path: z.string().default("settings"),
  showDebugSection: z.boolean().optional(),
  SettingsPage: z.custom<ComponentType>().optional(),
});

export type SettingsModuleConfig = z.infer<typeof configSchema>;

export const settingsModule = defineModule({
  name: "settings",
  version: "0.6.0",
  configSchema,
  appRoutes: (config) => [
    {
      path: config.path,
      handle: {
        titleKey: "nav.settings",
        tabId: "settings",
        tabIcon: "settings",
        showTabBar: true,
        layout: "main",
      },
      load: config.SettingsPage
        ? () => Promise.resolve({ default: config.SettingsPage! })
        : () => import("appspresso/pages/Settings"),
    },
  ],
});
