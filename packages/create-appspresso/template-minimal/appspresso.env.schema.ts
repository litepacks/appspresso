import { defineAppspressoEnvSchema } from "appspresso/studio";

export const envSchema = defineAppspressoEnvSchema({
  variables: [
    {
      key: "VITE_API_BASE_URL",
      description: "Backend API base URL (optional for minimal apps).",
      required: false,
      example: "https://api.example.com",
      format: "url",
    },
    {
      key: "VITE_ENABLE_DEBUG_PANEL",
      description: "Set to true to show the debug panel in development.",
      required: false,
      example: "true",
      format: "boolean",
    },
  ],
});
