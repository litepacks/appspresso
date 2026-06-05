import { CheckCircle2, XCircle } from "lucide-react";
import type { CheckDomain } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Props = {
  domains: CheckDomain[];
};

export function CheckResults({ domains }: Props) {
  return (
    <div className="studio-panel divide-y divide-border/40">
      {domains.map((d) => (
        <div key={d.domain} className="flex items-start gap-2.5 px-3 py-2.5">
          {d.ok ? (
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-400" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium capitalize">{d.domain}</p>
              <Badge variant={d.ok ? "success" : "destructive"} dot>
                {d.ok ? "ok" : String(d.issues.length)}
              </Badge>
            </div>
            {!d.ok && d.issues.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {d.issues.map((issue, i) => (
                  <li key={`${d.domain}-${i}`} className="text-[11px] text-muted-foreground">
                    {issue.path ? (
                      <code className="mr-1 font-mono text-[10px]">{issue.path}</code>
                    ) : null}
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
