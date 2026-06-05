import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  height?: string;
};

export function CodePanel({ children, className, height = "h-[420px]" }: Props) {
  return (
    <ScrollArea className={cn("studio-code", height, className)}>
      <pre className="p-4 font-mono text-[11px] leading-relaxed text-foreground/85">
        {children}
      </pre>
    </ScrollArea>
  );
}
