import { useContext } from "react";
import {
  RevenueCatContext,
  type RevenueCatContextValue,
} from "@/app/providers/RevenueCatProvider";

export function useRevenueCat(): RevenueCatContextValue {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) {
    throw new Error("useRevenueCat must be used within RevenueCatProvider");
  }
  return ctx;
}

export function useEntitlement(entitlementId?: string): boolean {
  const { customerInfo, defaultEntitlementId } = useRevenueCat();
  const id = entitlementId ?? defaultEntitlementId;
  return Boolean(id && customerInfo?.entitlements.active[id]);
}
