import { z } from "zod";

export const envVarDefinitionSchema = z.object({
  key: z
    .string()
    .regex(/^VITE_[A-Z0-9_]+$/, "Env keys must be VITE_* uppercase"),
  description: z.string().min(1),
  required: z.boolean().optional(),
  example: z.string().optional(),
  secret: z.boolean().optional(),
  format: z.enum(["string", "url", "boolean", "json"]).optional(),
});

export const appspressoEnvSchema = z.object({
  variables: z.array(envVarDefinitionSchema),
});

export type EnvVarDefinition = z.infer<typeof envVarDefinitionSchema>;
export type AppspressoEnvSchemaConfig = z.infer<typeof appspressoEnvSchema>;
