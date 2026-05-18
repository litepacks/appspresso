# Push notifications

## Summary

1. **Permission**: Request OS permission on first use; keep copy ready to open Settings when denied.
2. **Registration**: Obtain the device push token and send it to your server over a secure channel; listen for token refresh.
3. **Foreground**: Decide how to show notifications while the app is open (silent, in-app banner, ignore).
4. **Testing**: Keep sandbox and production certificates / FCM projects separate.

## Checklist

- [ ] Lifecycle in `src/services/push-notification.service.ts` wired into your app flow?
- [ ] Token storage aligned with PII / security policy?
- [ ] Non-essential features gracefully disabled on web or simulators?
