import { Provider } from "jotai";
import type { ReactNode } from "react";
import { appStore } from "@/state/store";

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={appStore}>{children}</Provider>;
}
