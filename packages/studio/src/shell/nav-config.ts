import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Box,
  Flag,
  LayoutDashboard,
  Palette,
  Plug,
  RefreshCw,
  Route,
  Save,
  ShieldCheck,
  Smartphone,
  Terminal,
  Variable,
} from "lucide-react";
import type { NavGroup, Screen } from "./types";

export type NavEntry = {
  id: Screen;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  enabled?: boolean;
  badge?: "soon" | "beta";
};

export const NAV_GROUPS: { id: NavGroup; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "configuration", label: "Configuration" },
  { id: "platform", label: "Platform" },
  { id: "development", label: "Development" },
  { id: "validation", label: "Validation" },
];

export const NAV_ITEMS: NavEntry[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, group: "project" },
  { id: "routes", label: "Routes", icon: Route, group: "configuration" },
  { id: "flags", label: "Flags", icon: Flag, group: "configuration" },
  { id: "theme", label: "Theme", icon: Palette, group: "configuration" },
  { id: "env", label: "Environment", icon: Variable, group: "configuration" },
  { id: "plugins", label: "Plugins", icon: Plug, group: "platform" },
  { id: "capacitor", label: "Capacitor", icon: Smartphone, group: "platform" },
  { id: "modules", label: "Modules", icon: Box, group: "platform", enabled: false, badge: "soon" },
  { id: "cli", label: "CLI", icon: Terminal, group: "development" },
  { id: "sync", label: "Sync", icon: RefreshCw, group: "development", enabled: false, badge: "soon" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "development", enabled: false, badge: "soon" },
  { id: "validation", label: "Validation", icon: ShieldCheck, group: "validation" },
  { id: "apply", label: "Apply", icon: Save, group: "validation" },
];
