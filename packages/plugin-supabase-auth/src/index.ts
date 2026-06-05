import { definePlugin } from "appspresso/plugin";

export { createSupabaseAuthAdapter } from "./adapter.js";

export const supabaseAuthPlugin = definePlugin({
  name: "@appspresso/plugin-supabase-auth",
  version: "0.3.0",
  requires: ["auth"],
  setup(ctx) {
    ctx.logger.info(
      "supabase-auth: pass createSupabaseAuthAdapter to AppspressoHost authAdapter",
    );
  },
})();
