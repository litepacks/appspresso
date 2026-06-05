import { Flag, Plug, Route, Variable } from "lucide-react";
import { useStudio } from "@/context/StudioContext";
import { useStudioNavigate } from "@/hooks/useStudioNavigate";
import { ChangedFilesList } from "@/dashboard/ChangedFilesList";
import { ConfigStatusTable } from "@/dashboard/ConfigStatusTable";
import { HealthScoreRing } from "@/dashboard/HealthScoreRing";
import { MetricTile } from "@/dashboard/MetricTile";
import { QuickActionGrid } from "@/dashboard/QuickActionGrid";
import { deriveProjectMetrics } from "@/lib/metrics";
import { ValidationDomainCard } from "@/validation/ValidationDomainCard";
import { ValidationHistory } from "@/validation/ValidationHistory";
import { Badge } from "@/components/ui/badge";

export function OverviewPage() {
  const {
    project,
    check,
    draft,
    saved,
    checking,
    saving,
    dirty,
    onCheck,
    onApply,
  } = useStudio();
  const navigate = useStudioNavigate();

  const metrics = deriveProjectMetrics(project, check, draft, saved);
  const checkOk = check?.every((d) => d.ok);
  const failedDomains = check?.filter((d) => !d.ok) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr_11rem]">
        <HealthScoreRing score={metrics.healthScore} label={metrics.healthLabel} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricTile
            icon={Route}
            label="Routes"
            value={metrics.routeCount}
            tone="primary"
            onClick={() => navigate("routes")}
          />
          <MetricTile
            icon={Flag}
            label="Flags"
            value={metrics.flagCount}
            onClick={() => navigate("flags")}
          />
          <MetricTile
            icon={Variable}
            label="Env vars"
            value={metrics.envVarCount}
            onClick={() => navigate("env")}
          />
          <MetricTile
            icon={Plug}
            label="Plugins"
            value={metrics.pluginCount}
            onClick={() => navigate("plugins")}
          />
        </div>
        <QuickActionGrid
          onValidate={onCheck}
          onSave={onApply}
          onOpenValidation={() => navigate("validation")}
          onOpenApply={() => navigate("apply")}
          checking={checking}
          saving={saving}
          dirty={dirty}
        />
      </div>

      {check ? (
        <div className="studio-panel px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">Validation summary</p>
            <Badge variant={checkOk ? "success" : "destructive"} dot>
              {metrics.validationPass}/{metrics.validationTotal} domains
            </Badge>
          </div>
          {failedDomains.length > 0 ? (
            <div className="mt-2 space-y-2">
              {failedDomains.slice(0, 3).map((d) => (
                <ValidationDomainCard key={d.domain} domain={d} defaultOpen />
              ))}
              {failedDomains.length > 3 ? (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => navigate("validation")}
                >
                  View all issues →
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">All domains passed.</p>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigStatusTable project={project} check={check} onNavigate={navigate} />
        <ChangedFilesList
          changedDomains={metrics.changedDomains}
          hasUnsavedChanges={metrics.hasUnsavedChanges}
        />
      </div>

      <ValidationHistory />
    </div>
  );
}
