import { useMemo, useState } from "react";
import type { CheckDomain } from "@/lib/api";
import { useStudio } from "@/context/StudioContext";
import { useStudioNavigate } from "@/hooks/useStudioNavigate";
import { ValidationDomainCard } from "@/validation/ValidationDomainCard";
import { ValidationHistory } from "@/validation/ValidationHistory";
import { ValidationSummaryBar } from "@/validation/ValidationSummaryBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DOMAIN_SCREEN } from "@/shell/types";

const ALLOWLIST = [
  "appspresso.routes.ts",
  "appspresso.flags.ts",
  "appspresso.theme.ts",
  "appspresso.env.schema.ts",
  ".env.example",
];

type Filter = "all" | "errors" | "passed";

function filterDomains(domains: CheckDomain[], filter: Filter): CheckDomain[] {
  if (filter === "errors") return domains.filter((d) => !d.ok);
  if (filter === "passed") return domains.filter((d) => d.ok);
  return domains;
}

export function ValidationPage() {
  const { check, checking, onCheck, onApply, saving } = useStudio();
  const navigate = useStudioNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const domains = useMemo(() => filterDomains(check ?? [], filter), [check, filter]);

  const openEditor = (domain: string) => {
    const screen = DOMAIN_SCREEN[domain];
    if (screen) navigate(screen);
  };

  if (!check) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTitle>Run validation</AlertTitle>
          <AlertDescription className="text-xs">
            Validate all config domains before applying changes to your project.
          </AlertDescription>
        </Alert>
        <Button onClick={onCheck} disabled={checking}>
          Run validation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ValidationSummaryBar domains={check} checking={checking} onRunAgain={onCheck} />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({check.length})</TabsTrigger>
          <TabsTrigger value="errors">
            Errors ({check.filter((d) => !d.ok).length})
          </TabsTrigger>
          <TabsTrigger value="passed">
            Passed ({check.filter((d) => d.ok).length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <div className="space-y-2">
            {domains.map((d) => (
              <ValidationDomainCard
                key={d.domain}
                domain={d}
                onOpenEditor={
                  DOMAIN_SCREEN[d.domain] ? () => openEditor(d.domain) : undefined
                }
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 lg:grid-cols-2">
        <ValidationHistory />
        <div className="studio-panel p-4">
          <p className="text-xs font-semibold">Write allowlist</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Studio never writes src/pages or .env
          </p>
          <ul className="mt-3 space-y-1">
            {ALLOWLIST.map((file) => (
              <li key={file}>
                <code className="font-mono text-[11px] text-muted-foreground">{file}</code>
              </li>
            ))}
          </ul>
          <Button className="mt-4" size="sm" onClick={onApply} disabled={saving}>
            Save allowlisted files
          </Button>
        </div>
      </div>
    </div>
  );
}
