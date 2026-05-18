import type { AuthAdapter } from "@/auth/adapter";

export type CustomAuthAdapterInput = {
  subscribe: AuthAdapter["subscribe"];
  signIn?: AuthAdapter["signIn"];
  signOut?: AuthAdapter["signOut"];
};

/**
 * For REST / enterprise IdP etc.: `subscribe` required; no-op if no sign-in/out.
 */
export function createCustomAuthAdapter(
  input: CustomAuthAdapterInput,
): AuthAdapter {
  return {
    subscribe: input.subscribe,
    signIn:
      input.signIn ??
      (async () => {
        // Host app can implement its flow via adapter.signIn.
      }),
    signOut:
      input.signOut ??
      (async () => {
        // Host app can implement its flow via adapter.signOut.
      }),
  };
}
