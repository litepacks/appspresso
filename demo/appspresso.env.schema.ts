import { defineAppspressoEnvSchema } from "appspresso/studio";

export const envSchema = defineAppspressoEnvSchema({
  variables: [
    {
      key: "VITE_API_BASE_URL",
      description: "Optional backend API base URL.",
      required: false,
      example: "",
      format: "url",
    },
    {
      key: "VITE_ENABLE_DEBUG_PANEL",
      description: "Show debug panel in development when true.",
      required: false,
      example: "true",
      format: "boolean",
    },
    {
      key: "VITE_FEATURE_FLAGS",
      description: "JSON object overriding feature flag defaults.",
      required: false,
      example: "{}",
      format: "json",
    },
    {
      key: "VITE_FEATURE_FLAGS_URL",
      description: "Optional remote feature flags JSON URL.",
      required: false,
      example: "",
      format: "url",
    },
  ],
});
