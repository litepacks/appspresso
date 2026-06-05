import { z } from "zod";

const hslTriple = z
  .string()
  .regex(/^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/)
  .optional();

export const appspressoAppMetaSchema = z.object({
  displayName: z.string().min(1),
  id: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Bundle id must be reverse-DNS (e.g. com.example.app)",
    ),
  version: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  splash: z
    .object({
      image: z.string().optional(),
      webPublicPath: z.string().optional(),
      webAnimation: z
        .enum(["none", "pulse", "float", "breathe", "sway", "glow"])
        .optional(),
      webBootstrapMinDurationMs: z.number().optional(),
      webExitDurationMs: z.number().optional(),
      launchShowDuration: z.number().optional(),
      launchAutoHide: z.boolean().optional(),
      launchFadeOutDuration: z.number().optional(),
      backgroundColor: z.string().optional(),
      androidSplashResourceName: z.string().optional(),
      androidScaleType: z.string().optional(),
      showSpinner: z.boolean().optional(),
      splashFullScreen: z.boolean().optional(),
      splashImmersive: z.boolean().optional(),
    })
    .optional(),
  statusBar: z
    .object({
      style: z.enum(["LIGHT", "DARK"]).optional(),
      backgroundColor: z.string().optional(),
      overlaysWebView: z.boolean().optional(),
      hidden: z.boolean().optional(),
    })
    .optional(),
  orientation: z
    .object({
      preferredLock: z
        .enum([
          "any",
          "portrait",
          "landscape",
          "portrait-primary",
          "landscape-primary",
        ])
        .optional(),
    })
    .optional(),
  sqlite: z
    .object({
      iosDatabaseLocation: z.string().optional(),
      iosIsEncryption: z.boolean().optional(),
      androidIsEncryption: z.boolean().optional(),
    })
    .optional(),
  theme: z
    .object({
      palette: z
        .object({
          light: z.record(z.string(), hslTriple).optional(),
          dark: z.record(z.string(), hslTriple).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ValidatedAppspressoAppMeta = z.infer<typeof appspressoAppMetaSchema>;

export function validateAppspressoAppMeta(
  meta: unknown,
): { ok: true; data: ValidatedAppspressoAppMeta } | { ok: false; error: string } {
  const r = appspressoAppMetaSchema.safeParse(meta);
  if (!r.success) {
    return { ok: false, error: r.error.message };
  }
  return { ok: true, data: r.data };
}
