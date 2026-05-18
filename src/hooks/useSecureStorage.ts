import { useCallback, useEffect, useState } from "react";
import {
  secureStorageGet,
  secureStorageRemove,
  secureStorageSet,
} from "@/services/secure-storage.service";

export function useSecureStorage(key: string) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void secureStorageGet(key).then((v) => {
      if (!cancelled) {
        setValue(v);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const set = useCallback(
    async (next: string) => {
      await secureStorageSet(key, next);
      setValue(next);
    },
    [key],
  );

  const remove = useCallback(async () => {
    await secureStorageRemove(key);
    setValue(null);
  }, [key]);

  return { value, loading, set, remove };
}
