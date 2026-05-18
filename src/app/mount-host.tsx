import { type ComponentType, type ReactElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { appspressoPackageConfig } from "@/config/appspresso.config";

export type BootAppspressoHostOptions = {
  rootComponent: ComponentType;
  root?: HTMLElement | null;
  rootElementId?: string;
  strictMode?: boolean;
};

function wrapStrict(enabled: boolean, node: ReactElement): ReactElement {
  return enabled ? <StrictMode>{node}</StrictMode> : node;
}

/** Sync mount for minimal hosts (no dependency on the full template `App`). */
export function bootAppspressoHost(options: BootAppspressoHostOptions): void {
  const mountCfg = appspressoPackageConfig.mount;
  const id = options.rootElementId ?? mountCfg.rootElementId;
  const el = options.root ?? document.getElementById(id);
  if (!el) {
    throw new Error(`Appspresso: mount node not found (#${id})`);
  }
  const strict = options.strictMode ?? mountCfg.strictMode;
  const Cmp = options.rootComponent;
  const tree = wrapStrict(strict, <Cmp />);
  createRoot(el).render(tree);
}
