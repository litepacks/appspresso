import axios from "axios";
import { getAccessToken } from "@/auth/session-store";
import { HTTP_TIMEOUT_MS } from "@/config/constants";
import { getEffectiveApiBaseUrl } from "@/config/runtime";
import { logger } from "@/lib/logger";
import { captureException } from "@/services/telemetry.service";

export const http = axios.create({
  timeout: HTTP_TIMEOUT_MS,
});

http.interceptors.request.use((config) => {
  config.baseURL = getEffectiveApiBaseUrl() || config.baseURL;
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    logger.error("http error", { message: err?.message });
    captureException(err, { kind: "axios" });
    return Promise.reject(err);
  },
);
