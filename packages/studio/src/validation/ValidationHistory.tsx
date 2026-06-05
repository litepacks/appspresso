import { getValidationHistory } from "@/lib/validation-history";
import { Badge } from "@/components/ui/badge";

export function ValidationHistory() {
  const history = getValidationHistory();

  if (history.length === 0) {
    return (
      <div className="studio-panel p-4">
        <p className="text-xs font-semibold">Validation history</p>
        <p className="mt-1 text-xs text-muted-foreground">No runs recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="studio-panel overflow-hidden">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold">Validation history</p>
      </div>
      <ul className="divide-y divide-border/40">
        {history.map((entry) => {
          const at = new Date(entry.at);
          const failed = entry.domains.filter((d) => !d.ok).length;
          return (
            <li
              key={entry.at}
              className="flex items-center justify-between gap-3 px-4 py-2 text-xs"
            >
              <span className="text-muted-foreground">
                {at.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-muted-foreground">{entry.durationMs}ms</span>
              <Badge variant={entry.ok ? "success" : "destructive"} dot>
                {entry.ok ? "pass" : `${failed} domains`}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
