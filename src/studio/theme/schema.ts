import { z } from "zod";

const hslTriple = z
  .string()
  .regex(
    /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/,
    'Expected HSL triple like "221 83% 53%"',
  );

export const themePaletteSlotsSchema = z.object({
  background: hslTriple.optional(),
  foreground: hslTriple.optional(),
  card: hslTriple.optional(),
  cardForeground: hslTriple.optional(),
  popover: hslTriple.optional(),
  popoverForeground: hslTriple.optional(),
  primary: hslTriple.optional(),
  primaryForeground: hslTriple.optional(),
  secondary: hslTriple.optional(),
  secondaryForeground: hslTriple.optional(),
  muted: hslTriple.optional(),
  mutedForeground: hslTriple.optional(),
  accent: hslTriple.optional(),
  accentForeground: hslTriple.optional(),
  destructive: hslTriple.optional(),
  destructiveForeground: hslTriple.optional(),
  border: hslTriple.optional(),
  input: hslTriple.optional(),
  ring: hslTriple.optional(),
});

export const appspressoThemeSchema = z.object({
  palette: z.object({
    light: themePaletteSlotsSchema.optional(),
    dark: themePaletteSlotsSchema.optional(),
  }),
  radius: z.string().min(1).optional(),
  fonts: z
    .object({
      sans: z.string().optional(),
      mono: z.string().optional(),
    })
    .optional(),
  assets: z.object({
    icon: z.string().min(1),
    splash: z.string().min(1).optional(),
  }),
});

export type AppspressoThemeConfig = z.infer<typeof appspressoThemeSchema>;
