import { createDemoAuthAdapter } from "appspresso/auth/adapters/demo";

/**
 * Demo app: no real Firebase/Supabase; uses the kit demo adapter.
 * If `AuthProvider` creates a new `createDemoAuthAdapter()` each render, Strict Mode double-subscribes;
 * a single instance is pinned at the demo root.
 */
export const demoMockAuthAdapter = createDemoAuthAdapter();
