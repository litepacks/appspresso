import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cleanupDeepLinks, initDeepLinks } from "@/deeplink/deeplink.service";

export function DeepLinkSync() {
  const navigate = useNavigate();
  useEffect(() => {
    void initDeepLinks(navigate);
    return () => {
      void cleanupDeepLinks();
    };
  }, [navigate]);
  return null;
}
