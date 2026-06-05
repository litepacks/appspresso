import { z } from "zod";

export const routeAccessSchema = z.object({
  public: z.boolean().optional(),
  requiresAuth: z.boolean().optional(),
  guestOnly: z.boolean().optional(),
});

export const routeEntrySchema = z.object({
  id: z.string().min(1).optional(),
  path: z.string(),
  titleKey: z.string().min(1),
  icon: z.string().min(1).optional(),
  screen: z.string().min(1),
  showTabBar: z.boolean().optional(),
  hideTabBarWhenKeyboardOpen: z.boolean().optional(),
  access: routeAccessSchema.optional(),
  badgeCount: z.number().int().nonnegative().optional(),
});

export const appspressoRoutesSchema = z.object({
  shell: z.enum(["bottomTabs", "stack", "minimal"]).default("bottomTabs"),
  tabs: z.array(routeEntrySchema).default([]),
  stack: z.array(routeEntrySchema).default([]),
  preApp: z.array(routeEntrySchema).default([]),
});

export type RouteAccess = z.infer<typeof routeAccessSchema>;
export type RouteEntry = z.infer<typeof routeEntrySchema>;
export type AppspressoRoutesConfig = z.infer<typeof appspressoRoutesSchema>;
