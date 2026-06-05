import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  index?: number;
  expanded?: boolean;
  onToggle?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children?: ReactNode;
  className?: string;
};

export function EditorItem({
  title,
  subtitle,
  badges,
  index,
  expanded = true,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  children,
  className,
}: Props) {
  const hasReorder = onMoveUp || onMoveDown;

  return (
    <div className={cn("studio-item", className)}>
      <div className="studio-item-header">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={onToggle}
          disabled={!onToggle}
        >
          {hasReorder ? (
            <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
          ) : null}
          {onToggle ? (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                !expanded && "-rotate-90",
              )}
            />
          ) : null}
          {index !== undefined ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/50 text-[10px] font-semibold tabular-nums text-muted-foreground">
              {index + 1}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-mono text-sm font-medium text-foreground">
                {title}
              </span>
              {badges}
            </div>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          {hasReorder ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="size-7"
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="size-7"
              >
                <ChevronDown />
              </Button>
            </>
          ) : null}
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 />
            </Button>
          ) : null}
        </div>
      </div>
      {expanded && children ? (
        <div className="studio-item-body">{children}</div>
      ) : null}
    </div>
  );
}
