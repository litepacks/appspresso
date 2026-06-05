import {
  ChevronDown,
  Flag,
  Palette,
  Plug,
  Route,
  Shield,
  Smartphone,
  Variable,
} from "lucide-react";
import { useState } from "react";
import type { CheckDomain } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueRow } from "./IssueRow";

const DOMAIN_ICONS: Record<string, typeof Route> = {
  routes: Route,
  flags: Flag,
  theme: Palette,
  env: Variable,
  plugins: Plug,
  capacitor: Smartphone,
  secrets: Shield,
};

type Props = {
  domain: CheckDomain;
  onOpenEditor?: () => void;
  defaultOpen?: boolean;
};

export function ValidationDomainCard({ domain, onOpenEditor, defaultOpen }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? !domain.ok);
  const Icon = DOMAIN_ICONS[domain.domain] ?? Shield;

  return (
    <div className="studio-panel overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setOpen(!open)}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{domain.domain}</span>
          <Badge variant={domain.ok ? "success" : "destructive"} dot>
            {domain.ok ? "pass" : `${domain.issues.length}`}
          </Badge>
          <ChevronDown
            className={cn(
              "ml-auto size-4 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {onOpenEditor ? (
          <Button variant="ghost" size="sm" onClick={onOpenEditor}>
            Open
          </Button>
        ) : null}
      </div>
      {open && domain.issues.length > 0 ? (
        <ul className="border-t border-border px-3 py-2">
          {domain.issues.map((issue, i) => (
            <IssueRow key={`${domain.domain}-${i}`} issue={issue} />
          ))}
        </ul>
      ) : open && domain.ok ? (
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Validation passed
        </p>
      ) : null}
    </div>
  );
}
