import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  list: ReactNode;
  detail?: ReactNode;
  className?: string;
};

export function EditorLayout({ list, detail, className }: Props) {
  if (!detail) {
    return <div className={className}>{list}</div>;
  }

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]", className)}>
      <div className="min-w-0">{list}</div>
      <div className="min-w-0">{detail}</div>
    </div>
  );
}
