import type { ReactNode } from "react";
import { RevenueCatProvider } from "appspresso/app/providers/RevenueCatProvider";
import { defineModule } from "appspresso/module";
import { z } from "zod";

const configSchema = z.object({
  path: z.string().default("purchase"),
  showStaleBanner: z.boolean().default(true),
});

export type SubscriptionsModuleConfig = z.infer<typeof configSchema>;

export const subscriptionsModule = defineModule({
  name: "subscriptions",
  version: "0.6.0",
  configSchema,
  appRoutes: (config) => [
    {
      path: config.path,
      handle: {
        titleKey: "nav.purchase",
        tabId: "purchase",
        tabIcon: "purchase",
        showTabBar: true,
        layout: "main",
      },
      load: () => import("appspresso/pages/Purchases"),
    },
  ],
  providers(_ctx, _config, children: ReactNode) {
    return <RevenueCatProvider>{children}</RevenueCatProvider>;
  },
});
