import { SECURE_STORAGE_KEYS } from "@/config/constants";
import {
  secureStorageGet,
  secureStorageRemove,
  secureStorageSet,
} from "@/services/secure-storage.service";

let accessTokenMem: string | null = null;

export function getAccessToken(): string | null {
  return accessTokenMem;
}

export async function hydrateTokensFromStorage(): Promise<void> {
  accessTokenMem = await secureStorageGet(SECURE_STORAGE_KEYS.accessToken);
}

export async function setAccessToken(token: string | null): Promise<void> {
  accessTokenMem = token;
  if (token) {
    await secureStorageSet(SECURE_STORAGE_KEYS.accessToken, token);
  } else {
    await secureStorageRemove(SECURE_STORAGE_KEYS.accessToken);
  }
}

export async function clearSession(): Promise<void> {
  accessTokenMem = null;
  await secureStorageRemove(SECURE_STORAGE_KEYS.accessToken);
  await secureStorageRemove(SECURE_STORAGE_KEYS.refreshToken);
}
