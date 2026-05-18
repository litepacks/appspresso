import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { initNetworkListeners } from "@/services/network.service";
import { networkStatusAtom } from "@/state/atoms";

/** Listens to network state; reads via `networkStatusAtom`. */
export function useNetworkStatus() {
  const status = useAtomValue(networkStatusAtom);

  useEffect(() => {
    return initNetworkListeners();
  }, []);

  return status;
}
