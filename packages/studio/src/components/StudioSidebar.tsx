import {
  Box,
  Flag,
  LayoutDashboard,
  Palette,
  Plug,
  Route,
  Save,
  Smartphone,
  Variable,
} from "lucide-react";
import { cn } from "@/lib/utils";
export type Screen =
  | "overview"
  | "routes"
  | "flags"
  | "theme"
  | "env"
  | "plugins"
  | "capacitor"
  | "apply";

type NavItem = { id: Screen; label: string; icon: typeof Route };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Project",
    items: [{ id: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Config",
    items: [
      { id: "routes", label: "Routes", icon: Route },
      { id: "flags", label: "Flags", icon: Flag },
      { id: "theme", label: "Theme", icon: Palette },
      { id: "env", label: "Environment", icon: Variable },
      { id: "plugins", label: "Plugins", icon: Plug },
      { id: "capacitor", label: "Capacitor", icon: Smartphone },
    ],
  },
  {
    label: "Workflow",
    items: [{ id: "apply", label: "Validate & Apply", icon: Save }],
  },
];

type Props = {
  screen: Screen;
  cwd?: string;
  dirty?: boolean;
  onNavigate: (screen: Screen) => void;
};

export function StudioSidebar({ screen, cwd, dirty, onNavigate }: Props) {
  const projectName = cwd?.split("/").pop() ?? "…";

  return (
    <aside className="flex h-screen w-52 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Box className="size-3.5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">Studio</p>
          <p className="truncate text-[10px] text-muted-foreground" title={cwd}>
            {projectName}
          </p>
        </div>
        {dirty ? (
          <span className="size-2 shrink-0 rounded-full bg-amber-400" title="Unsaved" />
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </p>
              <nav className="flex flex-col gap-px">
                {group.items.map(({ id, label, icon: Icon }) => {
                  const active = screen === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onNavigate(id)}
                      className={cn("studio-nav-item", active && "studio-nav-active")}
                    >
                      <span className="studio-nav-icon">
                        <Icon className="size-3" strokeWidth={active ? 2.25 : 1.75} />
                      </span>
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
