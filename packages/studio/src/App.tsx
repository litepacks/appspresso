import { useEffect, useMemo, useState } from "react";
import {
  applySlices,
  fetchCapacitorPreview,
  fetchProject,
  runCheck,
  type CheckDomain,
  type ProjectPayload,
} from "@/lib/api";
import {
  StudioSidebar,
  type Screen,
} from "@/components/StudioSidebar";
import { StatusBar } from "@/components/StatusBar";
import { ApplyPage } from "@/pages/ApplyPage";
import { CapacitorEditor } from "@/pages/CapacitorEditor";
import { EnvEditor } from "@/pages/EnvEditor";
import { FlagsEditor } from "@/pages/FlagsEditor";
import { OverviewPage } from "@/pages/OverviewPage";
import { PluginsEditor } from "@/pages/PluginsEditor";
import { RoutesEditor } from "@/pages/RoutesEditor";
import { ThemeEditor } from "@/pages/ThemeEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function App() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [project, setProject] = useState<ProjectPayload | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState<Record<string, unknown>>({});
  const [check, setCheck] = useState<CheckDomain[] | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [capPreview, setCapPreview] = useState<unknown>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const p = await fetchProject();
    setProject(p);
    const slices = {
      routes: p.slices.routes,
      flags: p.slices.flags,
      theme: p.slices.theme,
      envSchema: p.slices.envSchema,
      envExampleText: p.slices.envExampleText,
    };
    setDraft(slices);
    setSaved(slices);
    const cap = await fetchCapacitorPreview();
    setCapPreview(cap);
  };

  useEffect(() => {
    reload().catch((e) =>
      setMessage({ type: "err", text: String(e) }),
    );
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const onCheck = async () => {
    setChecking(true);
    try {
      const report = await runCheck();
      setCheck(report.domains);
      setMessage({
        type: report.ok ? "ok" : "err",
        text: report.ok ? "All checks passed." : "Validation failed.",
      });
    } catch (e) {
      setMessage({ type: "err", text: String(e) });
    } finally {
      setChecking(false);
    }
  };

  const onApply = async () => {
    setSaving(true);
    try {
      await applySlices(draft);
      setMessage({ type: "ok", text: "Saved allowlisted config files." });
      await reload();
      await onCheck();
    } catch (e) {
      setMessage({ type: "err", text: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    setDraft(saved);
    setMessage({ type: "ok", text: "Changes discarded." });
  };

  return (
    <div className="studio-shell flex flex-nowrap">
      <StudioSidebar
        screen={screen}
        cwd={project?.cwd}
        dirty={dirty}
        onNavigate={setScreen}
      />
      <div className="studio-main flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <main className="studio-content pb-14">
            {screen === "overview" ? (
              <OverviewPage
                project={project}
                check={check}
                checking={checking}
                onCheck={onCheck}
              />
            ) : null}
            {screen === "routes" ? (
              <RoutesEditor
                value={draft.routes}
                onChange={(routes) => setDraft((d) => ({ ...d, routes }))}
              />
            ) : null}
            {screen === "flags" ? (
              <FlagsEditor
                value={draft.flags}
                onChange={(flags) => setDraft((d) => ({ ...d, flags }))}
              />
            ) : null}
            {screen === "theme" ? (
              <ThemeEditor
                value={draft.theme}
                onChange={(theme) => setDraft((d) => ({ ...d, theme }))}
              />
            ) : null}
            {screen === "env" ? (
              <EnvEditor
                schema={draft.envSchema}
                exampleText={String(draft.envExampleText ?? "")}
                onChange={(envSchema, envExampleText) =>
                  setDraft((d) => ({ ...d, envSchema, envExampleText }))
                }
              />
            ) : null}
            {screen === "plugins" ? (
              <PluginsEditor project={project} />
            ) : null}
            {screen === "capacitor" ? (
              <CapacitorEditor preview={capPreview} project={project} />
            ) : null}
            {screen === "apply" ? (
              <ApplyPage
                check={check}
                checking={checking}
                saving={saving}
                onCheck={onCheck}
                onApply={onApply}
              />
            ) : null}
          </main>
        </div>
        <StatusBar dirty={dirty} saving={saving} onSave={onApply} onDiscard={onDiscard} />
      </div>

      {message ? (
        <Alert
          variant={message.type === "err" ? "destructive" : "success"}
          className="studio-toast"
        >
          <AlertDescription className="text-xs">{message.text}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
