# In-app purchases (IAP)

## Summary

1. **Store setup**: Complete product IDs, sandbox testers, and agreements in App Store Connect and Google Play Console.
2. **Client**: `@revenuecat/purchases-capacitor` and `RevenueCatProvider`; offerings and entitlements through one SDK. Details: [revenuecat.md](./revenuecat.md).
3. **Security**: Only your backend should validate receipts; client-side “purchased” alone is not enough.
4. **Testing**: Account for store documentation delays for sandbox product visibility and payment flows.

## Checklist

- [ ] RevenueCat entitlement / offering product IDs match the stores?
- [ ] `VITE_REVENUECAT_API_KEY_IOS` / `ANDROID` set for the right environment?
- [ ] `logIn` / `logOut` flow verified in production?
- [ ] Cancellation and refund cases handled?
- [ ] Loading and error states clear to users?
