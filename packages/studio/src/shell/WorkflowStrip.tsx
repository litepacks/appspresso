import { cn } from "@/lib/utils";
import { useStudio } from "@/context/StudioContext";
import {
  WORKFLOW_SCREENS,
  screenToWorkflow,
  type Screen,
  type WorkflowStep,
} from "./types";

const STEPS: { id: WorkflowStep; label: string; target: Screen }[] = [
  { id: "inspect", label: "Inspect", target: "overview" },
  { id: "edit", label: "Edit", target: "routes" },
  { id: "validate", label: "Validate", target: "validation" },
  { id: "apply", label: "Apply", target: "apply" },
];

type Props = {
  screen: import("./types").Screen;
  onNavigate: (screen: import("./types").Screen) => void;
};

export function WorkflowStrip({ screen, onNavigate }: Props) {
  const { dirty, check } = useStudio();
  const activeStep = screenToWorkflow(screen);
  const checkFail = check?.some((d) => !d.ok) ?? false;

  const stepWarning = (step: WorkflowStep) => {
    if (step === "edit" && dirty) return true;
    if (step === "validate" && checkFail) return true;
    if (step === "apply" && dirty) return true;
    return false;
  };

  return (
    <nav
      className="flex h-9 shrink-0 items-center gap-1 border-b border-border bg-surface-1/80 px-4"
      aria-label="Workflow"
    >
      {STEPS.map((step, i) => {
        const active = activeStep === step.id;
        const warn = stepWarning(step.id);
        return (
          <div key={step.id} className="flex items-center gap-1">
            {i > 0 ? (
              <span className="mx-1 text-muted-foreground/40" aria-hidden>
                /
              </span>
            ) : null}
            <button
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onNavigate(step.target)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-surface-3 text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              {warn ? (
                <span className="size-1.5 rounded-full bg-amber-400" aria-label="Needs attention" />
              ) : null}
              {step.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
