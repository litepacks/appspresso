import { Plug, Stethoscope } from "lucide-react";
import type { ProjectPayload } from "@/lib/api";
import { InspectorPanel } from "@/components/InspectorPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Props = {
  project: ProjectPayload | null;
};

export function PluginsEditor({ project }: Props) {
  const plugins = project?.slices.plugins;
  const count = Array.isArray(plugins) ? plugins.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[12rem_1fr]">
        <div className="studio-panel flex flex-col items-center justify-center p-4 text-center">
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{count}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Plug className="size-3.5" />
            registered plugin{count === 1 ? "" : "s"}
          </div>
        </div>
        <InspectorPanel
          title="Plugin registry"
          description="Exported from appspresso.plugins.ts — install via npm, then edit the file."
          json={plugins ?? []}
          height="h-[420px]"
        />
      </div>

      <Alert className="border-border/50 bg-muted/15">
        <Stethoscope className="size-3.5" />
        <AlertTitle className="text-sm">Health checks</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-2 text-xs">
          Run <Badge variant="outline">appspresso doctor</Badge> for dependency and env key
          validation after adding plugins.
        </AlertDescription>
      </Alert>
    </div>
  );
}
