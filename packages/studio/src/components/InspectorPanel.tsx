import type { ReactNode } from "react";
import { CodePanel } from "@/components/CodePanel";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  title: string;
  description?: string;
  children?: ReactNode;
  json?: unknown;
  height?: string;
};

export function InspectorPanel({
  title,
  description,
  children,
  json,
  height = "h-[420px]",
}: Props) {
  return (
    <div className="studio-panel flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 p-3">
        {children ?? (
          <CodePanel height={height}>
            {JSON.stringify(json ?? {}, null, 2)}
          </CodePanel>
        )}
      </div>
    </div>
  );
}
