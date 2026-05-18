# RevenueCat + Capacitor

This template uses a **single** IAP path via `@revenuecat/purchases-capacitor`: `RevenueCatProvider`, `useRevenueCat`, `useEntitlement`.

## Setup summary

1. **Dashboard**: Define entitlement (e.g. `pro`), offering, packages; align product IDs with App Store Connect / Google Play.
2. **Environment variables** (**public** SDK keys only; secret keys stay on the server):

   - `VITE_REVENUECAT_API_KEY_IOS`
   - `VITE_REVENUECAT_API_KEY_ANDROID`

3. **Package config**: `revenuecat.entitlementId` in `src/config/appspresso.config.ts` must match UI and atoms (default `pro`).
4. **Native sync**: At repo root, `npm run cap:sync` (or `npx cap sync`). Android/iOS projects pick up the RevenueCat plugin this way.
5. **Provider order**: In `AppspressoRootProviders`, `AuthProvider` wraps `RevenueCatProvider` so `useAuth` can call `Purchases.logIn` / `logOut`; order is **Auth → RevenueCat → I18n → …**.

## Auth

On sign-in, call `logIn({ appUserID })`; on sign-out (only when leaving a known session), `logOut`. Skipping `logIn` can attach entitlements to the wrong user/device.

## Web

There is no store in the browser; the SDK is not configured to error on web, so `RevenueCatProvider` is effectively a no-op and `purchaseStatusAtom` becomes `web-skipped`.

## Related files

- `src/app/providers/RevenueCatProvider.tsx`
- `src/hooks/useRevenueCat.ts`
- `src/services/purchase.service.ts` (imperative helpers; configure runs in `RevenueCatProvider`)
- `docs/playbooks/iap.md` — store and security notes
