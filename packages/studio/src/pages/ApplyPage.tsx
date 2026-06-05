import { Loader2, Play, Save } from "lucide-react";
import type { CheckDomain } from "@/lib/api";
import { CheckResults } from "@/components/CheckResults";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ALLOWLIST = [
  "appspresso.routes.ts",
  "appspresso.flags.ts",
  "appspresso.theme.ts",
  "appspresso.env.schema.ts",
  ".env.example",
];

type Props = {
  check: CheckDomain[] | null;
  checking?: boolean;
  saving?: boolean;
  onCheck: () => void;
  onApply: () => void;
};

export function ApplyPage({ check, checking, saving, onCheck, onApply }: Props) {
  const hasErrors = check?.some((d) => !d.ok);

  return (
    <div>
      <PageHeader
        title="Validate & Apply"
        description="Run validation, then save allowlisted config files."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onCheck} disabled={checking || saving}>
              {checking ? <Loader2 className="animate-spin" /> : <Play />}
              Check
            </Button>
            <Button size="sm" onClick={onApply} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Write allowlist</CardTitle>
            <CardDescription>Studio never touches src/pages or .env</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 p-0 pb-2">
            {ALLOWLIST.map((file) => (
              <div key={file} className="studio-row py-2.5">
                <code className="font-mono text-[11px] text-foreground/85">{file}</code>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          {!check ? (
            <Alert className="border-border/50 bg-muted/15">
              <AlertTitle className="text-sm">Validate before saving</AlertTitle>
              <AlertDescription className="text-xs">
                Run validation to ensure all domains pass Zod and safety checks.
              </AlertDescription>
            </Alert>
          ) : (
            <CheckResults domains={check} />
          )}

          {check && hasErrors ? (
            <Alert variant="destructive">
              <AlertTitle className="text-sm">Validation issues detected</AlertTitle>
              <AlertDescription className="text-xs">
                You can still save, but fix issues before committing or running native sync.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>
    </div>
  );
}
