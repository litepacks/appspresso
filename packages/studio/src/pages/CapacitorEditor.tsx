import type { ProjectPayload } from "@/lib/api";
import { InspectorPanel } from "@/components/InspectorPanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  preview: unknown;
  project: ProjectPayload | null;
};

export function CapacitorEditor({ preview, project }: Props) {
  const app = (project?.slices.config as { app?: unknown } | undefined)?.app;
  const cap = preview as { ok?: boolean; capacitor?: unknown; error?: string };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="preview" className="space-y-3">
        <TabsList>
          <TabsTrigger value="preview">Merged preview</TabsTrigger>
          <TabsTrigger value="source">App meta source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          {cap?.ok === false ? (
            <Alert variant="destructive">
              <AlertTitle>Preview failed</AlertTitle>
              <AlertDescription>{cap.error}</AlertDescription>
            </Alert>
          ) : (
            <InspectorPanel
              title="capacitor export"
              description="Output of defineAppspressoProject — write via appspresso cap:config"
              json={cap?.capacitor ?? {}}
              height="h-[480px]"
            />
          )}
        </TabsContent>

        <TabsContent value="source">
          <InspectorPanel
            title="app slice"
            description="Identity, splash, statusBar, sqlite from appspresso.config.ts"
            json={app ?? {}}
            height="h-[480px]"
          />
        </TabsContent>
      </Tabs>

      <Alert className="border-border/50 bg-muted/15">
        <AlertTitle className="text-sm">Native sync workflow</AlertTitle>
        <AlertDescription className="text-xs">
          After changing native-affecting fields:{" "}
          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
            appspresso cap:config
          </code>{" "}
          then{" "}
          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px]">
            appspresso native sync
          </code>
        </AlertDescription>
      </Alert>
    </div>
  );
}
