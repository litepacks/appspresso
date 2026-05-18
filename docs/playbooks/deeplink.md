# Deep links

## Summary

1. **Scheme and universal links**: App identity (`myapp://…`) and optional HTTPS App Links / Universal Links can share the same routing logic.
2. **Parsing**: Incoming URLs are turned into structured payloads in `src/deeplink/deeplink.parser.ts`; unknown URLs fall back safely to `/`.
3. **Router**: `src/deeplink/deeplink.handler.ts` applies the resolved route via React Router `navigate`; `DeepLinkSync` must be active in the tree.
4. **Debugging**: `useDeepLinkListener` exposes a summary of the last handled link (template: `RootShell` / `DeepLinkSync`).

## Test examples

- `myapp://referral?code=abc` — covered in parser unit tests.
- Invalid or empty host — app should navigate to home.

## Related code

- `src/deeplink/`
- `src/app/DeepLinkSync.tsx`
- `src/hooks/useDeepLinkListener.ts`
