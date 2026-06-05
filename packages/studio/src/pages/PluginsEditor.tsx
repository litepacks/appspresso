import { Plug, Stethoscope } from "lucide-react";
import type { ProjectPayload } from "@/lib/api";
import { CodePanel } from "@/components/CodePanel";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  project: ProjectPayload | null;
};

export function PluginsEditor({ project }: Props) {
  const plugins = project?.slices.plugins;
  const count = Array.isArray(plugins) ? plugins.length : 0;

  return (
    <div>
      <PageHeader
        title="Installed Plugins"
        description="View registered plugins — install via npm, then edit appspresso.plugins.ts."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Registry</CardTitle>
            <CardDescription>Plugins exported from appspresso.plugins.ts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-semibold tabular-nums tracking-tight">{count}</p>
              <Plug className="mb-1.5 size-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">registered plugin(s)</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Raw export</CardTitle>
            <CardDescription>v0.4 read-only — config forms coming in a future release</CardDescription>
          </CardHeader>
          <CardContent>
            <CodePanel height="h-[340px]">
              {JSON.stringify(plugins ?? [], null, 2)}
            </CodePanel>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-5 border-border/50 bg-muted/15">
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
