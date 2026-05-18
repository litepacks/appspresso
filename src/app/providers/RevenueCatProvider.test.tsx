import { render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RevenueCatProvider } from "@/app/providers/RevenueCatProvider";
import { AuthProvider } from "@/auth/context";
import { entitlementActiveAtom, purchaseStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

const configure = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const addCustomerInfoUpdateListener = vi.hoisted(() =>
  vi.fn(() => Promise.resolve("cb-id")),
);
const removeCustomerInfoUpdateListener = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ wasRemoved: true })),
);
const getCustomerInfo = vi.hoisted(() =>
  vi.fn(() =>
    Promise.resolve({
      customerInfo: {
        entitlements: { active: {}, all: {} },
        activeSubscriptions: [],
        allPurchasedProductIdentifiers: [],
        latestExpirationDate: null,
        firstSeen: "",
        originalAppUserId: "",
        requestDate: "",
        allExpirationDates: {},
        allPurchaseDates: {},
        subscriptionsByProductIdentifier: {},
        nonSubscriptionTransactions: [],
      },
    }),
  ),
);
const logOut = vi.hoisted(() => vi.fn(() => getCustomerInfo()));

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => "web",
  },
}));

vi.mock("@/config/env", () => ({
  getEnvConfig: () => ({}),
}));

vi.mock("@revenuecat/purchases-capacitor", () => ({
  Purchases: {
    configure,
    addCustomerInfoUpdateListener,
    removeCustomerInfoUpdateListener,
    getCustomerInfo,
    logIn: vi.fn(),
    logOut,
    getOfferings: vi.fn(),
    purchasePackage: vi.fn(),
    restorePurchases: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RevenueCatProvider>{children}</RevenueCatProvider>
    </AuthProvider>
  );
}

describe("RevenueCatProvider", () => {
  afterEach(() => {
    appStore.set(purchaseStatusAtom, "idle");
    appStore.set(entitlementActiveAtom, false);
    vi.clearAllMocks();
  });

  it("on web skips configure and logs web-skipped", async () => {
    render(<span>ok</span>, { wrapper });
    await waitFor(() => {
      expect(appStore.get(purchaseStatusAtom)).toBe("web-skipped");
    });
    expect(configure).not.toHaveBeenCalled();
  });
});
