import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { StudioProvider, useStudio } from "@/context/StudioContext";
import { ApplyPage } from "@/pages/ApplyPage";
import { CapacitorEditor } from "@/pages/CapacitorEditor";
import { CliPage } from "@/pages/CliPage";
import { EnvEditor } from "@/pages/EnvEditor";
import { FlagsEditor } from "@/pages/FlagsEditor";
import { OverviewPage } from "@/pages/OverviewPage";
import { PluginsEditor } from "@/pages/PluginsEditor";
import { RoutesEditor } from "@/pages/RoutesEditor";
import { ThemeEditor } from "@/pages/ThemeEditor";
import { ValidationPage } from "@/pages/ValidationPage";
import { CommandPalette } from "@/shell/CommandPalette";
import { pathToScreen, screenToPath } from "@/shell/paths";
import { StudioShell } from "@/shell/StudioShell";
import type { Screen } from "@/shell/types";

function StudioRoutesInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const screen = pathToScreen(location.pathname);
  const { draft, setDraft, project, capPreview } = useStudio();

  const setScreen = (s: Screen) => {
    navigate(screenToPath(s));
  };

  return (
    <StudioShell screen={screen} onNavigate={setScreen}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/cli" element={<CliPage />} />
        <Route
          path="/routes"
          element={
            <RoutesEditor
              value={draft.routes}
              onChange={(routes) => setDraft((d) => ({ ...d, routes }))}
            />
          }
        />
        <Route
          path="/flags"
          element={
            <FlagsEditor
              value={draft.flags}
              onChange={(flags) => setDraft((d) => ({ ...d, flags }))}
            />
          }
        />
        <Route
          path="/theme"
          element={
            <ThemeEditor
              value={draft.theme}
              onChange={(theme) => setDraft((d) => ({ ...d, theme }))}
            />
          }
        />
        <Route
          path="/env"
          element={
            <EnvEditor
              schema={draft.envSchema}
              exampleText={String(draft.envExampleText ?? "")}
              onChange={(envSchema, envExampleText) =>
                setDraft((d) => ({ ...d, envSchema, envExampleText }))
              }
            />
          }
        />
        <Route path="/plugins" element={<PluginsEditor project={project} />} />
        <Route
          path="/capacitor"
          element={<CapacitorEditor preview={capPreview} project={project} />}
        />
      </Routes>
      <CommandPalette />
    </StudioShell>
  );
}

function ScreenSync() {
  const location = useLocation();
  useEffect(() => {
    const screen = pathToScreen(location.pathname);
    document.title = `Studio — ${screen}`;
  }, [location.pathname]);
  return null;
}

export function AppRoutes() {
  return (
    <StudioProvider>
      <ScreenSync />
      <StudioRoutesInner />
    </StudioProvider>
  );
}
