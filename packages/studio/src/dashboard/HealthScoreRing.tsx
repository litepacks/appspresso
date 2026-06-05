import { cn } from "@/lib/utils";
import type { HealthLabel } from "@/lib/metrics";

type Props = {
  score: number;
  label: HealthLabel;
  className?: string;
};

const labelText: Record<HealthLabel, string> = {
  healthy: "Healthy",
  attention: "Needs attention",
  critical: "Critical",
};

const strokeColor: Record<HealthLabel, string> = {
  healthy: "stroke-emerald-400",
  attention: "stroke-amber-400",
  critical: "stroke-red-400",
};

export function HealthScoreRing({ score, label, className }: Props) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative size-20 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            className={cn(strokeColor[label], "transition-all duration-500")}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project health
        </p>
        <p className="text-sm font-medium">{labelText[label]}</p>
      </div>
    </div>
  );
}
