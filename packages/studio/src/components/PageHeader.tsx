import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, toolbar, actions }: Props) {
  return (
    <header className="mb-4 space-y-3 border-b border-border pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
    </header>
  );
}
