import { beforeEach, describe, expect, it, vi } from "vitest";
import { purchaseStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const mockIsNative = vi.hoisted(() => vi.fn(() => false));
const configure = vi.hoisted(() => vi.fn());
const getOfferings = vi.hoisted(() => vi.fn());
const purchasePackageNative = vi.hoisted(() => vi.fn());
const restorePurchasesNative = vi.hoisted(() => vi.fn());
const getCustomerInfo = vi.hoisted(() => vi.fn());

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNative(),
  },
}));

vi.mock("@revenuecat/purchases-capacitor", () => ({
  Purchases: {
    configure,
    getOfferings,
    purchasePackage: purchasePackageNative,
    restorePurchases: restorePurchasesNative,
    getCustomerInfo,
  },
}));

import {
  getOfferingsPackages,
  initPurchases,
  purchasePackage,
  restorePurchases,
} from "@/services/purchase.service";

describe("purchase.service", () => {
  beforeEach(() => {
    mockIsNative.mockReturnValue(false);
    configure.mockReset();
    getOfferings.mockReset();
    purchasePackageNative.mockReset();
    restorePurchasesNative.mockReset();
    getCustomerInfo.mockReset();
    appStore.set(purchaseStatusAtom, "idle");
  });

  it("initPurchases sets web-skipped on web", async () => {
    await initPurchases();
    expect(appStore.get(purchaseStatusAtom)).toBe("web-skipped");
  });

  it("initPurchases does not change atom on native (RevenueCatProvider owns state)", async () => {
    mockIsNative.mockReturnValue(true);
    await initPurchases();
    expect(appStore.get(purchaseStatusAtom)).toBe("idle");
  });

  it("getOfferingsPackages returns empty array on web", async () => {
    expect(await getOfferingsPackages()).toEqual([]);
  });

  it("getOfferingsPackages returns packages on native", async () => {
    mockIsNative.mockReturnValue(true);
    const pkgs = [{ identifier: "monthly" }];
    getOfferings.mockResolvedValue({
      current: { availablePackages: pkgs },
    });
    expect(await getOfferingsPackages()).toEqual(pkgs);
  });

  it("getOfferingsPackages returns empty array on error", async () => {
    mockIsNative.mockReturnValue(true);
    getOfferings.mockRejectedValue(new Error("nop"));
    expect(await getOfferingsPackages()).toEqual([]);
  });

  it("purchasePackage returns null on web", async () => {
    expect(await purchasePackage({} as never)).toBeNull();
  });

  it("purchasePackage returns result on native", async () => {
    mockIsNative.mockReturnValue(true);
    purchasePackageNative.mockResolvedValue({
      customerInfo: {},
      productIdentifier: "x",
    });
    const pkg = {} as never;
    expect(await purchasePackage(pkg)).toEqual({
      customerInfo: {},
      productIdentifier: "x",
    });
    expect(purchasePackageNative).toHaveBeenCalledWith({ aPackage: pkg });
  });

  it("purchasePackage returns null on error", async () => {
    mockIsNative.mockReturnValue(true);
    purchasePackageNative.mockRejectedValue(new Error("fail"));
    expect(await purchasePackage({} as never)).toBeNull();
  });

  it("restorePurchases returns null on web", async () => {
    expect(await restorePurchases()).toBeNull();
  });

  it("restorePurchases returns customerInfo on native", async () => {
    mockIsNative.mockReturnValue(true);
    restorePurchasesNative.mockResolvedValue(undefined);
    getCustomerInfo.mockResolvedValue({ customerInfo: { mock: true } });
    expect(await restorePurchases()).toEqual({ mock: true });
  });

  it("restorePurchases returns null on error", async () => {
    mockIsNative.mockReturnValue(true);
    restorePurchasesNative.mockRejectedValue(new Error("x"));
    expect(await restorePurchases()).toBeNull();
  });
});
