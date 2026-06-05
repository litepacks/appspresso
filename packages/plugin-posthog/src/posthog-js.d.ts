declare module "posthog-js" {
  const posthog: {
    init: (key: string, options?: Record<string, unknown>) => void;
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (id: string, traits?: Record<string, unknown>) => void;
    reset: () => void;
  };
  export default posthog;
}
