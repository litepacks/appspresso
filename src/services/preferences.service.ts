import { STORAGE_KEY_PREFIX } from "@/config/constants";

const pfx = `${STORAGE_KEY_PREFIX}pref_`;

export const preferencesService = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(`${pfx}${key}`);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(`${pfx}${key}`, value);
    } catch {
      /* ignore */
    }
  },
};
