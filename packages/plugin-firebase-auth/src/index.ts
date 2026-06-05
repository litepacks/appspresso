import { definePlugin } from "appspresso/plugin";

export { createFirebaseAuthAdapter } from "./adapter.js";

/** Marker plugin — wire `createFirebaseAuthAdapter` via `AppspressoHost` `authAdapter`. */
export const firebaseAuthPlugin = definePlugin({
  name: "@appspresso/plugin-firebase-auth",
  version: "0.3.0",
  requires: ["auth"],
  optionalPeers: ["@appspresso/plugin-sentry"],
  setup(ctx) {
    ctx.logger.info(
      "firebase-auth: pass createFirebaseAuthAdapter to AppspressoHost authAdapter",
    );
  },
})();
