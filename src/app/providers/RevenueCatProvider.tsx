import { Capacitor } from "@capacitor/core";
import {
  type CustomerInfo,
  type MakePurchaseResult,
  Purchases,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "@revenuecat/purchases-capacitor";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/auth/useAuth";
import { REVENUECAT_ENTITLEMENT_ID } from "@/config/constants";
import { getEnvConfig } from "@/config/env";
import { getRevenueCatApiKeyForPlatform } from "@/config/revenuecat";
import { logger } from "@/lib/logger";
import { entitlementActiveAtom, purchaseStatusAtom } from "@/state/atoms";
import { appStore } from "@/state/store";

export type RevenueCatContextValue = {
  /** SDK configured and initial customer info read (always on web). */
  ready: boolean;
  /** Real store (iOS/Android native); false on web. */
  isNativeStore: boolean;
  error: Error | null;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  defaultEntitlementId: typeof REVENUECAT_ENTITLEMENT_ID;
  refresh: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchasePackage: (
    pkg: PurchasesPackage,
  ) => Promise<MakePurchaseResult | null>;
  restorePurchases: () => Promise<CustomerInfo | null>;
};

export const RevenueCatContext = createContext<RevenueCatContextValue | null>(
  null,
);

function applyCustomerInfo(info: CustomerInfo | null): void {
  appStore.set(
    entitlementActiveAtom,
    Boolean(
      REVENUECAT_ENTITLEMENT_ID &&
        info?.entitlements.active[REVENUECAT_ENTITLEMENT_ID],
    ),
  );
}

export function RevenueCatProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const isNativeStore = Capacitor.isNativePlatform();

  const [ready, setReady] = useState(!isNativeStore);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  const listenerIdRef = useRef<string | null>(null);
  const wasSignedInRef = useRef(false);

  const setInfoAndAtoms = useCallback((info: CustomerInfo | null) => {
    setCustomerInfo(info);
    applyCustomerInfo(info);
  }, []);

  useEffect(() => {
    if (!isNativeStore) {
      appStore.set(purchaseStatusAtom, "web-skipped");
      setInfoAndAtoms(null);
      setReady(true);
      setConfigured(false);
      return;
    }

    const env = getEnvConfig();
    const apiKey = getRevenueCatApiKeyForPlatform(env);
    if (!apiKey) {
      logger.warn("RevenueCat: no public API key for platform", {
        platform: Capacitor.getPlatform(),
      });
      const err = new Error("RevenueCat API key missing");
      setError(err);
      appStore.set(purchaseStatusAtom, "error");
      setReady(true);
      setConfigured(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await Purchases.configure({ apiKey });
        if (cancelled) return;

        const id = await Purchases.addCustomerInfoUpdateListener((info) => {
          setInfoAndAtoms(info);
        });
        listenerIdRef.current = id;

        const { customerInfo: initial } = await Purchases.getCustomerInfo();
        if (cancelled) return;
        setInfoAndAtoms(initial);
        setError(null);
        setConfigured(true);
        appStore.set(purchaseStatusAtom, "ready");
        setReady(true);
      } catch (e) {
        logger.warn("RevenueCat configure", { e: String(e) });
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          appStore.set(purchaseStatusAtom, "error");
          setConfigured(false);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      const lid = listenerIdRef.current;
      listenerIdRef.current = null;
      if (lid) {
        void Purchases.removeCustomerInfoUpdateListener({
          listenerToRemove: lid,
        });
      }
    };
  }, [isNativeStore, setInfoAndAtoms]);

  useEffect(() => {
    if (!isNativeStore || !configured) return;

    const signedIn = auth.status === "signedIn" && Boolean(auth.user?.id);
    let cancelled = false;

    void (async () => {
      try {
        if (signedIn && auth.user?.id) {
          const { customerInfo: ci } = await Purchases.logIn({
            appUserID: auth.user.id,
          });
          if (!cancelled) {
            setInfoAndAtoms(ci);
            wasSignedInRef.current = true;
          }
        } else if (wasSignedInRef.current) {
          const { customerInfo: ci } = await Purchases.logOut();
          if (!cancelled) {
            setInfoAndAtoms(ci);
            wasSignedInRef.current = false;
          }
        }
      } catch (e) {
        logger.warn("RevenueCat auth linking", { e: String(e) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNativeStore, configured, auth.status, auth.user?.id, setInfoAndAtoms]);

  const refresh = useCallback(async () => {
    if (!isNativeStore || !configured) return;
    try {
      const { customerInfo: ci } = await Purchases.getCustomerInfo();
      setInfoAndAtoms(ci);
    } catch (e) {
      logger.warn("RevenueCat getCustomerInfo", { e: String(e) });
    }
  }, [isNativeStore, configured, setInfoAndAtoms]);

  const loadOfferings = useCallback(async () => {
    if (!isNativeStore || !configured) return;
    try {
      const o = await Purchases.getOfferings();
      setOfferings(o);
    } catch (e) {
      logger.warn("RevenueCat getOfferings", { e: String(e) });
      setOfferings(null);
    }
  }, [isNativeStore, configured]);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<MakePurchaseResult | null> => {
      if (!isNativeStore || !configured) return null;
      try {
        const result = await Purchases.purchasePackage({ aPackage: pkg });
        setInfoAndAtoms(result.customerInfo);
        return result;
      } catch (e) {
        logger.warn("RevenueCat purchasePackage", { e: String(e) });
        return null;
      }
    },
    [isNativeStore, configured, setInfoAndAtoms],
  );

  const restorePurchasesCb =
    useCallback(async (): Promise<CustomerInfo | null> => {
      if (!isNativeStore || !configured) return null;
      try {
        await Purchases.restorePurchases();
        const { customerInfo: ci } = await Purchases.getCustomerInfo();
        setInfoAndAtoms(ci);
        return ci;
      } catch (e) {
        logger.warn("RevenueCat restorePurchases", { e: String(e) });
        return null;
      }
    }, [isNativeStore, configured, setInfoAndAtoms]);

  const value = useMemo<RevenueCatContextValue>(
    () => ({
      ready,
      isNativeStore,
      error,
      customerInfo,
      offerings,
      defaultEntitlementId: REVENUECAT_ENTITLEMENT_ID,
      refresh,
      loadOfferings,
      purchasePackage,
      restorePurchases: restorePurchasesCb,
    }),
    [
      ready,
      isNativeStore,
      error,
      customerInfo,
      offerings,
      refresh,
      loadOfferings,
      purchasePackage,
      restorePurchasesCb,
    ],
  );

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}
