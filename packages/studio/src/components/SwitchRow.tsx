import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  children?: ReactNode;
};

export function SwitchRow({
  id,
  label,
  hint,
  checked,
  onCheckedChange,
  className,
  children,
}: Props) {
  return (
    <div className={cn("studio-switch-row", className)}>
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[13px] font-medium text-foreground/90">
          {label}
        </Label>
        {hint ? <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p> : null}
      </div>
      {children ?? (
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      )}
    </div>
  );
}
