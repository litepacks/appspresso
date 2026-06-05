import { Loader2, Play, Terminal } from "lucide-react";
import type { CheckDomain, ProjectPayload } from "@/lib/api";
import { CheckResults } from "@/components/CheckResults";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SLICE_LABELS: Record<string, string> = {
  routes: "Routes",
  flags: "Feature Flags",
  theme: "Theme Tokens",
  envSchema: "Env Schema",
  plugins: "Plugins",
  config: "Project Config",
  envExample: ".env.example",
};

type Props = {
  project: ProjectPayload | null;
  check: CheckDomain[] | null;
  checking?: boolean;
  onCheck: () => void;
};

export function OverviewPage({ project, check, checking, onCheck }: Props) {
  const present = project?.present ?? {};
  const allPresent = Object.values(present).every(Boolean);
  const presentCount = Object.values(present).filter(Boolean).length;
  const total = Object.keys(SLICE_LABELS).length;
  const checkOk = check?.every((d) => d.ok);

  return (
    <div className="space-y-3">
      <PageHeader
        title="Overview"
        description="Config slices and validation status"
        actions={
          <Button size="sm" onClick={onCheck} disabled={checking}>
            {checking ? <Loader2 className="animate-spin" /> : <Play />}
            Validate
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-2.5">
          <div>
            <CardTitle>Project status</CardTitle>
            <CardDescription>
              {allPresent ? "All config files present" : "Missing config files"}
            </CardDescription>
          </div>
          <Badge variant={allPresent ? "success" : "warning"} dot>
            {presentCount}/{total}
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 p-0 pb-3 md:grid-cols-[1fr_11rem]">
          <div className="border-t border-border/40 md:border-r md:border-t-0">
            {Object.entries(SLICE_LABELS).map(([key, label]) => {
              const ok = present[key] === true;
              return (
                <div key={key} className="studio-row py-2">
                  <span className="text-xs">{label}</span>
                  <Badge variant={ok ? "success" : "destructive"} dot>
                    {ok ? "ok" : "missing"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="px-4 pt-2 md:pt-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              CLI
            </p>
            <div className="space-y-1">
              {["appspresso doctor", "appspresso analyze", "appspresso studio --check"].map(
                (cmd) => (
                  <code
                    key={cmd}
                    className="studio-inset block break-all px-2 py-1 font-mono text-[10px] leading-snug text-muted-foreground"
                  >
                    {cmd}
                  </code>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {check ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Validation
            </p>
            <Badge variant={checkOk ? "success" : "warning"} dot>
              {checkOk ? "pass" : "issues"}
            </Badge>
          </div>
          <CheckResults domains={check} />
        </div>
      ) : (
        <Alert className="py-2">
          <Terminal className="size-3.5" />
          <AlertTitle className="text-xs">No validation yet</AlertTitle>
          <AlertDescription className="text-[11px]">
            Run validate before saving.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
