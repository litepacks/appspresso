import type { ReactNode } from "react";

/** i18n is initialized in `@/i18n` (English-only). This wrapper stays for a stable provider boundary. */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
