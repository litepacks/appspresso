import type { CheckIssue } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Props = {
  issue: CheckIssue;
};

export function IssueRow({ issue }: Props) {
  const copyPath = () => {
    if (issue.path) navigator.clipboard.writeText(issue.path);
  };

  return (
    <li className="flex items-start gap-2 py-1.5 text-xs text-muted-foreground">
      {issue.path ? (
        <code className="shrink-0 rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80">
          {issue.path}
        </code>
      ) : null}
      <span className="min-w-0 flex-1 leading-relaxed">{issue.message}</span>
      {issue.path ? (
        <Button variant="ghost" size="sm" className="h-6 shrink-0 px-2 text-[10px]" onClick={copyPath}>
          Copy
        </Button>
      ) : null}
    </li>
  );
}
