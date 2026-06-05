import type { ReactNode } from "react";
import { StatusBar } from "@/components/StatusBar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStudio } from "@/context/StudioContext";
import type { Screen } from "./types";
import { StudioSidebar } from "./StudioSidebar";
import { StudioTopBar } from "./StudioTopBar";
import { WorkflowStrip } from "./WorkflowStrip";

type Props = {
  children: ReactNode;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
};

export function StudioShell({ children, screen, onNavigate }: Props) {
  const { dirty, saving, onApply, onDiscard, message } = useStudio();

  return (
    <div className="studio-shell flex flex-nowrap">
      <StudioSidebar screen={screen} onNavigate={onNavigate} />
      <div className="studio-main flex min-h-0 min-w-0 flex-1 flex-col">
        <StudioTopBar screen={screen} />
        <WorkflowStrip screen={screen} onNavigate={onNavigate} />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <main className="studio-content pb-14">{children}</main>
        </div>
        <StatusBar dirty={dirty} saving={saving} onSave={onApply} onDiscard={onDiscard} />
      </div>

      {message ? (
        <Alert
          variant={message.type === "err" ? "destructive" : "success"}
          className="studio-toast"
          role="status"
          aria-live="polite"
        >
          <AlertDescription className="text-xs">{message.text}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
