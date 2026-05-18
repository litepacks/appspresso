import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAP_PRODUCT_IDS } from "@/config/constants";
import { useEntitlement, useRevenueCat } from "@/hooks/useRevenueCat";
import { initPurchases } from "@/services/purchase.service";
import { purchaseStatusAtom } from "@/state/atoms";

export default function Purchases() {
  const { t } = useTranslation();
  const status = useAtomValue(purchaseStatusAtom);
  const hasEntitlement = useEntitlement();
  const {
    ready,
    isNativeStore,
    error,
    offerings,
    loadOfferings,
    purchasePackage,
    restorePurchases,
    defaultEntitlementId,
  } = useRevenueCat();

  useEffect(() => {
    void initPurchases();
  }, []);

  const packages = offerings?.current?.availablePackages ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("purchase.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">status: {status}</p>
          {!isNativeStore ? (
            <p className="rounded-md border border-dashed p-3 text-muted-foreground">
              {t("purchase.webNotice")}
            </p>
          ) : null}
          {error ? (
            <p className="text-destructive text-xs">{error.message}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Entitlement: {defaultEntitlementId} →{" "}
            {hasEntitlement ? "active" : "inactive"}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("purchase.legacyProductIds")}: {IAP_PRODUCT_IDS.join(", ")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!ready || !isNativeStore}
              onClick={() => {
                void loadOfferings();
              }}
            >
              {t("purchase.load")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!ready || !isNativeStore}
              onClick={() => {
                void restorePurchases();
              }}
            >
              {t("purchase.restore")}
            </Button>
          </div>
          {packages.length ? (
            <ul className="list-disc space-y-2 pl-5">
              {packages.map((p) => (
                <li
                  key={p.identifier}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span>{p.product.title ?? p.identifier}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void purchasePackage(p);
                    }}
                  >
                    {t("purchase.buy")}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
