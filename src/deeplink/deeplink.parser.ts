import { DEEPLINK_SCHEME } from "@/config/constants";
import { logger } from "@/lib/logger";
import type { DeepLinkPayload } from "./deeplink.types";

export function parseDeepLink(url: string): DeepLinkPayload | null {
  try {
    const u = new URL(url);
    const scheme = u.protocol.replace(/:$/, "");
    if (scheme !== DEEPLINK_SCHEME) return null;
    let pathKey = "";
    if (u.hostname) {
      const rest =
        u.pathname && u.pathname !== "/" ? u.pathname.replace(/^\//, "") : "";
      pathKey = rest ? `${u.hostname}/${rest}` : u.hostname;
    } else {
      pathKey = u.pathname.replace(/^\//, "").replace(/\/$/, "");
    }
    const params: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return { scheme, pathKey, params, rawUrl: url };
  } catch (e) {
    if (import.meta.env.DEV)
      logger.debug("parseDeepLink", { e: String(e), url });
    return null;
  }
}
