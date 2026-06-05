import type { SyncProvider } from "./provider";

let activeProvider: SyncProvider | null = null;

export function registerSyncProvider(provider: SyncProvider): void {
  activeProvider = provider;
}

export function getSyncProvider(): SyncProvider | null {
  return activeProvider;
}

export function clearSyncProvider(): void {
  activeProvider = null;
}
