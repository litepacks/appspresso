import { Loader2, Play, Save } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { useStudioNavigate } from "@/hooks/useStudioNavigate";
import { ValidationDomainCard } from "@/validation/ValidationDomainCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DOMAIN_SCREEN } from "@/shell/types";

const ALLOWLIST = [
  "appspresso.routes.ts",
  "appspresso.flags.ts",
  "appspresso.theme.ts",
  "appspresso.env.schema.ts",
  ".env.example",
];

export function ApplyPage() {
  const { check, checking, saving, onCheck, onApply } = useStudio();
  const navigate = useStudioNavigate();
  const hasErrors = check?.some((d) => !d.ok);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCheck} disabled={checking || saving}>
          {checking ? <Loader2 className="animate-spin" /> : <Play />}
          Validate
        </Button>
        <Button size="sm" onClick={onApply} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="studio-panel h-fit lg:col-span-2">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold">Write allowlist</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Studio never touches src/pages or .env
            </p>
          </div>
          <ul className="divide-y divide-border/40">
            {ALLOWLIST.map((file) => (
              <li key={file} className="px-4 py-2.5">
                <code className="font-mono text-[11px] text-foreground/85">{file}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 lg:col-span-3">
          {!check ? (
            <Alert className="border-border/50 bg-muted/15">
              <AlertTitle className="text-sm">Validate before saving</AlertTitle>
              <AlertDescription className="text-xs">
                Run validation to ensure all domains pass Zod and safety checks. Or open the{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => navigate("validation")}
                >
                  validation hub
                </button>
                .
              </AlertDescription>
            </Alert>
          ) : (
            check.map((d) => (
              <ValidationDomainCard
                key={d.domain}
                domain={d}
                onOpenEditor={
                  DOMAIN_SCREEN[d.domain] ? () => navigate(DOMAIN_SCREEN[d.domain]) : undefined
                }
              />
            ))
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
