import { useEffect } from "react";
import { initAppLifecycle, teardownAppLifecycle } from "@/services/app.service";

export function AppLifecycleSync() {
  useEffect(() => {
    void initAppLifecycle();
    return () => {
      void teardownAppLifecycle();
    };
  }, []);
  return null;
}
