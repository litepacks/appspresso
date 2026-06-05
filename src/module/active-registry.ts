import type { ModuleRegistry } from "./registry";

let active: ModuleRegistry | null = null;

export function setActiveModuleRegistry(registry: ModuleRegistry | null): void {
  active = registry;
}

export function getActiveModuleRegistry(): ModuleRegistry | null {
  return active;
}
