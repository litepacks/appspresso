export type ThemePreference = "light" | "dark" | "system";

export type RuntimeConfig = {
  apiBaseUrlOverride?: string;
  featureFlags?: Record<string, boolean>;
};
