import { ChevronRight, Loader2, Play, Save, Search } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { deriveProjectMetrics } from "@/lib/metrics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { Screen } from "./types";
import { SCREEN_META } from "./types";

type Props = {
  screen: Screen;
};

export function StudioTopBar({ screen }: Props) {
  const {
    project,
    draft,
    saved,
    check,
    checking,
    saving,
    dirty,
    onCheck,
    onApply,
    openCommandPalette,
  } = useStudio();

  const meta = SCREEN_META[screen];
  const metrics = deriveProjectMetrics(project, check, draft, saved);
  const checkOk = check?.every((d) => d.ok);
  const checkFail = check && !checkOk;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-1 px-4">
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="truncate font-medium text-muted-foreground">
          {metrics.projectName}
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
        <span className="truncate text-muted-foreground">{meta.section}</span>
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
        <span className="truncate font-semibold">{meta.breadcrumb}</span>
      </div>

      <button
        type="button"
        onClick={openCommandPalette}
        className="hidden items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-surface-3 sm:flex"
      >
        <Search className="size-3.5" />
        <span>Search…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {check ? (
          <Badge variant={checkOk ? "success" : "destructive"} dot>
            {checkOk ? "valid" : "issues"}
          </Badge>
        ) : (
          <Badge variant="secondary">not validated</Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onCheck}
          disabled={checking || saving}
        >
          {checking ? <Loader2 className="animate-spin" /> : <Play />}
          Validate
        </Button>
        <Button
          size="sm"
          onClick={onApply}
          disabled={!dirty || saving}
          className={dirty ? "" : "opacity-50"}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
      </div>
    </header>
  );
}
