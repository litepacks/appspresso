import { Capacitor } from "@capacitor/core";
import {
  Purchases,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import { logger } from "@/lib/logger";
import { purchaseStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

/**
 * Updates status atom on web; RevenueCatProvider manages RevenueCat state on native.
 */
export async function initPurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    appStore.set(purchaseStatusAtom, "web-skipped");
    return;
  }
}

/** Native: Offerings packages; web or error: `[]`. */
export async function getOfferingsPackages(): Promise<PurchasesPackage[]> {
  if (!Capacitor.isNativePlatform()) return [];
  try {
    const o: PurchasesOfferings = await Purchases.getOfferings();
    const current = o.current;
    if (!current?.availablePackages?.length) return [];
    return current.availablePackages;
  } catch (e) {
    logger.warn("getOfferingsPackages", { e: String(e) });
    return [];
  }
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<Awaited<ReturnType<typeof Purchases.purchasePackage>> | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    return await Purchases.purchasePackage({ aPackage: pkg });
  } catch (e) {
    logger.warn("purchasePackage", { e: String(e) });
    return null;
  }
}

export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    await Purchases.restorePurchases();
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (e) {
    logger.warn("restorePurchases", { e: String(e) });
    return null;
  }
}
