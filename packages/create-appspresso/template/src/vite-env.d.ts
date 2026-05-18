/// <reference types="vite/client" />

declare module "*.json" {
  // biome-ignore lint/suspicious/noExplicitAny: JSON bundle shape for i18n
  const value: Record<string, any>;
  export default value;
}
