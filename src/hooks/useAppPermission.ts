import { useCallback, useEffect, useState } from "react";
import type {
  AppPermission,
  UnifiedPermissionStatus,
} from "@/permissions/types";
import {
  getPermissionStatus,
  requestPermission,
} from "@/services/permission-manager.service";

export function useAppPermission(kind: AppPermission) {
  const [status, setStatus] = useState<UnifiedPermissionStatus>("unavailable");

  const refresh = useCallback(async () => {
    setStatus(await getPermissionStatus(kind));
  }, [kind]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const request = useCallback(async () => {
    const next = await requestPermission(kind);
    setStatus(next);
    return next;
  }, [kind]);

  return { status, refresh, request };
}
