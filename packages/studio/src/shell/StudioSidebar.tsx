import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useStudio } from "@/context/StudioContext";
import { NAV_GROUPS, NAV_ITEMS } from "./nav-config";
import type { Screen } from "./types";

type Props = {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
};

export function StudioSidebar({ screen, onNavigate }: Props) {
  const { project, dirty } = useStudio();
  const projectName = project?.cwd?.split("/").pop() ?? "…";

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 border-b border-border px-3 py-3">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Box className="size-3.5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">Appspresso Studio</p>
          <p className="truncate text-[10px] text-muted-foreground" title={project?.cwd}>
            {projectName}
          </p>
        </div>
        {dirty ? <span className="size-2 shrink-0 rounded-full bg-amber-400" title="Unsaved" /> : null}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-4">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id}>
                <p className="mb-1 px-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </p>
                <nav className="flex flex-col gap-px">
                  {items.map(({ id, label, icon: Icon, enabled = true, badge }) => {
                    const active = screen === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={!enabled}
                        onClick={() => enabled && onNavigate(id)}
                        className={cn(
                          "studio-nav-item relative",
                          active && "studio-nav-active",
                          !enabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {active ? (
                          <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                        ) : null}
                        <span className="studio-nav-icon">
                          <Icon className="size-3" strokeWidth={active ? 2.25 : 1.75} />
                        </span>
                        <span className="truncate">{label}</span>
                        {badge ? (
                          <Badge variant="outline" className="ml-auto text-[8px] uppercase">
                            {badge}
                          </Badge>
                        ) : null}
                      </button>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
