import { OnboardingEntry } from "appspresso/app/OnboardingEntry";
import { OnboardingLayout } from "appspresso/components/OnboardingLayout";
import { lazyRouteFromImport } from "appspresso/lib/declarative-routes";
import { defineModule } from "appspresso/module";
import { z } from "zod";

const stepSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  skippable: z.boolean().optional(),
});

const configSchema = z.object({
  basePath: z.string().default("onboarding"),
  steps: z.array(stepSchema).optional(),
});

export type OnboardingModuleConfig = z.infer<typeof configSchema>;

export const onboardingModule = defineModule({
  name: "onboarding",
  version: "0.6.0",
  configSchema,
  routes: (config) => ({
    basePath: config.basePath.replace(/^\//, ""),
    order: "pre-app",
    requiresOnboardingGate: true,
    layout: { element: <OnboardingEntry /> },
    routes: [
      {
        element: <OnboardingLayout />,
        children: [
          {
            index: true,
            lazy: lazyRouteFromImport(
              () => import("appspresso/pages/OnboardingPage"),
            ),
          },
        ],
      },
    ],
  }),
});
