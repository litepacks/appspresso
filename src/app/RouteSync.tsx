import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { currentRouteAtom } from "@/state/atoms";

export function RouteSync() {
  const loc = useLocation();
  const setCurrent = useSetAtom(currentRouteAtom);
  useEffect(() => {
    setCurrent(`${loc.pathname}${loc.search}`);
  }, [loc.pathname, loc.search, setCurrent]);
  return null;
}
