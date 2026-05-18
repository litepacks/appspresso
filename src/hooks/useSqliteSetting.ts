import { useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { getSetting, setSetting } from "@/db/sqlite";
import { sqliteStatusAtom } from "@/state/atoms";

export type UseSqliteSettingOptions = {
  /** Default shown when no DB row or on web */
  defaultValue?: string;
};

export type UseSqliteSettingResult = {
  /** Value read from SQLite (or default) */
  value: string;
  /** Writes to `app_settings`; no-op on web / closed DB */
  setStoredValue: (next: string) => Promise<void>;
  /** Re-read when key or availability changes */
  refresh: () => Promise<void>;
  /** Initial load attempt finished */
  ready: boolean;
  /** Whether native SQLite is open */
  available: boolean;
};

/**
 * Single-key read/write for `app_settings`.
 * On web builds `available` stays false; value is `defaultValue`.
 */
export function useSqliteSetting(
  key: string,
  options?: UseSqliteSettingOptions,
): UseSqliteSettingResult {
  const defaultValue = options?.defaultValue ?? "";
  const sqlite = useAtomValue(sqliteStatusAtom);
  const [value, setValue] = useState(defaultValue);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!sqlite.available) {
      setValue(defaultValue);
      setReady(true);
      return;
    }
    const v = await getSetting(key);
    setValue(v ?? defaultValue);
    setReady(true);
  }, [key, sqlite.available, defaultValue]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setStoredValue = useCallback(
    async (next: string) => {
      if (!sqlite.available) return;
      await setSetting(key, next);
      setValue(next);
    },
    [key, sqlite.available],
  );

  return {
    value,
    setStoredValue,
    refresh,
    ready,
    available: sqlite.available,
  };
}
