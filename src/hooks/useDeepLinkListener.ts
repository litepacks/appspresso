import { useAtomValue } from "jotai";
import { lastDeepLinkSnapshotAtom } from "@/state/atoms";

/** Last deep link summary updated by `DeepLinkSync` / `handleDeepLink`. */
export function useDeepLinkListener() {
  return useAtomValue(lastDeepLinkSnapshotAtom);
}
