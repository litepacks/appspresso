import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { screenToPath } from "@/shell/paths";
import type { Screen } from "@/shell/types";

export function useStudioNavigate() {
  const navigate = useNavigate();
  return useCallback((screen: Screen) => navigate(screenToPath(screen)), [navigate]);
}
