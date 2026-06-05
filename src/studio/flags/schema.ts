import { z } from "zod";

export const flagEnvironmentSchema = z.object({
  development: z.boolean().optional(),
  staging: z.boolean().optional(),
  production: z.boolean().optional(),
});

export const flagDefinitionSchema = z.object({
  default: z.boolean(),
  description: z.string().min(1),
  owner: z.string().min(1).optional(),
  envKey: z.string().min(1).optional(),
  environments: flagEnvironmentSchema.optional(),
});

export const appspressoFlagsSchema = z.record(z.string(), flagDefinitionSchema);

export type FlagDefinition = z.infer<typeof flagDefinitionSchema>;
export type AppspressoFlagsConfig = z.infer<typeof appspressoFlagsSchema>;
