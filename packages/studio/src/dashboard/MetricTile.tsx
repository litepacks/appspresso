import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  onClick?: () => void;
  tone?: "default" | "success" | "warning" | "primary";
};

const toneBg = {
  default: "bg-muted/50 text-muted-foreground",
  success: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-amber-500/10 text-amber-400",
  primary: "bg-primary/10 text-primary",
};

export function MetricTile({ icon: Icon, label, value, onClick, tone = "default" }: Props) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-surface-2 p-3 text-left transition-colors",
        onClick && "hover:bg-surface-3",
      )}
    >
      <div className={cn("flex size-8 items-center justify-center rounded-md", toneBg[tone])}>
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </Comp>
  );
}
