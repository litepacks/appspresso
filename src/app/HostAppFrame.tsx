import type { ReactNode } from "react";
import type { AppspressoViteHostConfig } from "@/build/inject-env";
import { cn } from "@/lib/utils";

export type HostAppFrameProps = {
  host: Pick<AppspressoViteHostConfig, "hostBanner">;
  children: ReactNode;
  className?: string;
};

/**
 * Vite host config (`createAppspressoViteConfig` → `__APSPRESSO_HOST__.hostBanner`)
 * with top strip; app body is `children`.
 */
export function HostAppFrame({ host, children, className }: HostAppFrameProps) {
  const b = host.hostBanner;
  if (!b?.enabled) {
    return (
      <div
        className={cn(
          "flex h-dvh max-h-dvh min-h-0 w-full min-w-0 flex-col overflow-hidden",
          className,
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden",
        className,
      )}
    >
      <header className="safe-top shrink-0 border-b bg-muted/60 px-4 pb-3 text-center text-muted-foreground text-xs leading-relaxed">
        {b.title ? (
          <strong className="text-foreground">{b.title}</strong>
        ) : null}
        {b.title && b.body ? " — " : null}
        {b.body ? <span>{b.body}</span> : null}
      </header>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
