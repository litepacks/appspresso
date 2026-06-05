import { defineAppspressoFlags } from "appspresso/studio";

export const flags = defineAppspressoFlags({
  enableDebugPanel: {
    default: true,
    description: "Show the in-app debug panel in development builds.",
    envKey: "VITE_ENABLE_DEBUG_PANEL",
  },
  demoShowcaseNav: {
    default: true,
    description: "Use demo showcase tab navigation metadata.",
  },
});
