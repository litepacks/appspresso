import type { ComponentType } from "react";
import { AuthEntry } from "appspresso/app/AuthEntry";
import { AuthLayout } from "appspresso/components/AuthLayout";
import { lazyRouteFromImport } from "appspresso/lib/declarative-routes";
import { defineModule } from "appspresso/module";
import { z } from "zod";

const screensSchema = z
  .object({
    Login: z.custom<ComponentType>().optional(),
    Register: z.custom<ComponentType>().optional(),
    ForgotPassword: z.custom<ComponentType>().optional(),
  })
  .optional();

const configSchema = z.object({
  basePath: z.string().default("/auth"),
  enableRegister: z.boolean().default(true),
  enableForgotPassword: z.boolean().default(true),
  screens: screensSchema,
});

export type AuthModuleConfig = z.infer<typeof configSchema>;

function lazyPage(
  fallback: () => Promise<{ default: ComponentType }>,
  override?: ComponentType,
) {
  if (override) {
    return async () => ({ Component: override });
  }
  return lazyRouteFromImport(fallback);
}

export const authModule = defineModule({
  name: "auth",
  version: "0.6.0",
  configSchema,
  suggestsPlugins: [
    "@appspresso/plugin-firebase-auth",
    "@appspresso/plugin-supabase-auth",
  ],
  routes: (config) => {
    const base = config.basePath.replace(/^\//, "").replace(/\/$/, "");
    const children = [
      {
        path: "login",
        lazy: lazyPage(
          () => import("appspresso/pages/AuthLoginPage"),
          config.screens?.Login,
        ),
      },
    ];
    if (config.enableRegister) {
      children.push({
        path: "register",
        lazy: lazyPage(
          () => import("appspresso/pages/AuthRegisterPage"),
          config.screens?.Register,
        ),
      });
    }
    if (config.enableForgotPassword) {
      children.push({
        path: "forgot-password",
        lazy: lazyPage(
          () => import("appspresso/pages/AuthForgotPasswordPage"),
          config.screens?.ForgotPassword,
        ),
      });
    }
    return {
      basePath: base,
      order: "pre-app",
      layout: { element: <AuthEntry /> },
      routes: [
        {
          element: <AuthLayout />,
          children,
        },
      ],
    };
  },
});

export { RequireAuth } from "./RequireAuth";
