export type Screen =
  | "overview"
  | "validation"
  | "apply"
  | "routes"
  | "flags"
  | "theme"
  | "env"
  | "plugins"
  | "capacitor"
  | "cli"
  | "modules"
  | "sync"
  | "analytics";

export type WorkflowStep = "inspect" | "edit" | "validate" | "apply";

export type NavGroup =
  | "project"
  | "configuration"
  | "platform"
  | "development"
  | "validation";

export type NavItem = {
  id: Screen;
  label: string;
  group: NavGroup;
  enabled?: boolean;
  badge?: "soon" | "beta";
};

export const WORKFLOW_SCREENS: Record<WorkflowStep, Screen[]> = {
  inspect: ["overview", "plugins", "capacitor", "cli"],
  edit: ["routes", "flags", "theme", "env"],
  validate: ["validation"],
  apply: ["apply"],
};

export function screenToWorkflow(screen: Screen): WorkflowStep {
  for (const [step, screens] of Object.entries(WORKFLOW_SCREENS) as [
    WorkflowStep,
    Screen[],
  ][]) {
    if (screens.includes(screen)) return step;
  }
  return "inspect";
}

export const SCREEN_META: Record<
  Screen,
  { title: string; section: string; breadcrumb: string }
> = {
  overview: { title: "Overview", section: "Project", breadcrumb: "Overview" },
  validation: { title: "Validation", section: "Validation", breadcrumb: "Validation" },
  apply: { title: "Apply", section: "Validation", breadcrumb: "Apply Changes" },
  routes: { title: "Routes", section: "Configuration", breadcrumb: "Routes" },
  flags: { title: "Flags", section: "Configuration", breadcrumb: "Feature Flags" },
  theme: { title: "Theme", section: "Configuration", breadcrumb: "Theme" },
  env: { title: "Environment", section: "Configuration", breadcrumb: "Environment" },
  plugins: { title: "Plugins", section: "Platform", breadcrumb: "Plugins" },
  capacitor: { title: "Capacitor", section: "Platform", breadcrumb: "Capacitor" },
  cli: { title: "CLI", section: "Development", breadcrumb: "CLI Reference" },
  modules: { title: "Modules", section: "Platform", breadcrumb: "Modules" },
  sync: { title: "Sync", section: "Development", breadcrumb: "Sync" },
  analytics: { title: "Analytics", section: "Development", breadcrumb: "Analytics" },
};

export const DOMAIN_SCREEN: Record<string, Screen> = {
  routes: "routes",
  flags: "flags",
  theme: "theme",
  env: "env",
  plugins: "plugins",
  capacitor: "capacitor",
  secrets: "env",
};
