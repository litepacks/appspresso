import type { PluginRegistry } from "./registry";

let active: PluginRegistry | null = null;

export function setActivePluginRegistry(registry: PluginRegistry | null): void {
  active = registry;
}

export function getActivePluginRegistry(): PluginRegistry | null {
  return active;
}
