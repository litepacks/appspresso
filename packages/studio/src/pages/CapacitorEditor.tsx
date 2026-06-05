import type { ProjectPayload } from "@/lib/api";
import { CodePanel } from "@/components/CodePanel";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  preview: unknown;
  project: ProjectPayload | null;
};

export function CapacitorEditor({ preview, project }: Props) {
  const app = (project?.slices.config as { app?: unknown } | undefined)?.app;
  const cap = preview as { ok?: boolean; capacitor?: unknown; error?: string };

  return (
    <div>
      <PageHeader
        title="Capacitor Config"
        description="Edit source in appspresso.config.ts — merged JSON is preview-only."
      />

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Merged preview</TabsTrigger>
          <TabsTrigger value="source">App meta source</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>capacitor export</CardTitle>
              <CardDescription>
                Output of defineAppspressoProject — write via appspresso cap:config
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cap?.ok === false ? (
                <Alert variant="destructive">
                  <AlertTitle>Preview failed</AlertTitle>
                  <AlertDescription>{cap.error}</AlertDescription>
                </Alert>
              ) : (
                <CodePanel height="h-[480px]">
                  {JSON.stringify(cap?.capacitor ?? {}, null, 2)}
                </CodePanel>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>app slice</CardTitle>
              <CardDescription>
                Identity, splash, statusBar, sqlite from appspresso.config.ts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodePanel height="h-[480px]">
                {JSON.stringify(app ?? {}, null, 2)}
              </CodePanel>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="mt-5 border-border/50 bg-muted/15">
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
