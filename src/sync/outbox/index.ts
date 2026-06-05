import { Capacitor } from "@capacitor/core";
import { createWebIdbOutboxStore } from "./web-idb-store";
import type { OutboxStore } from "./types";

let store: OutboxStore | null = null;

/** After native `initDatabase`, wires the SQLite-backed outbox (dynamic import). */
export async function ensureNativeOutboxStore(): Promise<OutboxStore> {
  if (store) return store;
  const { createSqliteOutboxStore } = await import("./sqlite-store");
  store = createSqliteOutboxStore();
  return store;
}

export function getOutboxStore(): OutboxStore {
  if (!store) {
    if (Capacitor.getPlatform() === "web") {
      store = createWebIdbOutboxStore();
    } else {
      throw new Error(
        "Native outbox not ready — ensure SQLite is open and call ensureNativeOutboxStore()",
      );
    }
  }
  return store;
}

export function resetOutboxStoreForTests(): void {
  store = null;
}

export type { OutboxStore } from "./types";
