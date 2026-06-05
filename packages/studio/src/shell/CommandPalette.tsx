import { Command } from "cmdk";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Loader2,
  Play,
  Save,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStudioNavigate } from "@/hooks/useStudioNavigate";
import { NAV_ITEMS } from "./nav-config";
import type { Screen } from "./types";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useStudioNavigate();
  const { onCheck, onApply, dirty, checking, saving, setOpenCommandPalette } = useStudio();

  useEffect(() => {
    setOpenCommandPalette(() => () => setOpen(true));
  }, [setOpenCommandPalette]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !saving) onApply();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (!checking) onCheck();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, checking, onApply, onCheck]);

  const go = (screen: Screen) => {
    navigate(screen);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="bg-surface-2">
          <Command.Input
            placeholder="Search pages and actions…"
            className="h-11 border-b border-border bg-transparent px-4 text-sm outline-none"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results.
            </Command.Empty>
            <Command.Group heading="Actions" className="text-xs text-muted-foreground">
              <Command.Item
                onSelect={() => {
                  onCheck();
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                {checking ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                Run validation
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  onApply();
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <Save className="size-4" />
                Save changes
              </Command.Item>
            </Command.Group>
            <Command.Group heading="Navigate" className="text-xs text-muted-foreground">
              {NAV_ITEMS.filter((i) => i.enabled !== false).map((item) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => go(item.id)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Quick" className="text-xs text-muted-foreground">
              <Command.Item
                onSelect={() => go("overview")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <LayoutDashboard className="size-4" />
                Overview
              </Command.Item>
              <Command.Item
                onSelect={() => go("validation")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <ShieldCheck className="size-4" />
                Validation hub
              </Command.Item>
              <Command.Item
                onSelect={() => go("cli")}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent"
              >
                <Terminal className="size-4" />
                CLI reference
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
