import { Loader2, Play } from "lucide-react";
import type { CheckDomain } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Props = {
  domains: CheckDomain[];
  checking?: boolean;
  onRunAgain: () => void;
};

export function ValidationSummaryBar({ domains, checking, onRunAgain }: Props) {
  const passed = domains.filter((d) => d.ok).length;
  const errors = domains.filter((d) => !d.ok).reduce((n, d) => n + d.issues.length, 0);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>
          <strong className="text-emerald-400">{passed}</strong>
          <span className="text-muted-foreground">/{domains.length} passed</span>
        </span>
        {errors > 0 ? (
          <span className="text-red-400">{errors} issue{errors === 1 ? "" : "s"}</span>
        ) : (
          <span className="text-muted-foreground">No issues</span>
        )}
      </div>
      <Button size="sm" variant="outline" onClick={onRunAgain} disabled={checking}>
        {checking ? <Loader2 className="animate-spin" /> : <Play />}
        Run again
      </Button>
    </div>
  );
}
