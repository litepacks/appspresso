import { clearSession, setAccessToken } from "@/auth/session-store";
import { logger } from "@/lib/logger";

/**
 * Persists the access token used by `api/http` (`Authorization: Bearer`).
 * Call from auth adapters when the session token changes.
 */
export async function syncHttpAccessToken(token: string | null): Promise<void> {
  try {
    if (token) {
      await setAccessToken(token);
    } else {
      await clearSession();
    }
  } catch (e) {
    logger.error("auth.tokenBridge", { e: String(e) });
    throw e;
  }
}
