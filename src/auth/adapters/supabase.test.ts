import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken } from "@/auth/session-store";

type AuthChangeCb = (
  event: string,
  session: { access_token: string; user: { id: string; email: string } } | null,
) => void;

describe("createSupabaseAuthAdapter", () => {
  let authChangeCb: AuthChangeCb | undefined;

  afterEach(async () => {
    sessionStorage.clear();
    await clearSession();
    authChangeCb = undefined;
    vi.clearAllMocks();
  });

  function mockClient(
    session: AuthChangeCb extends (...args: infer P) => void ? P[1] : never,
  ) {
    return {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session } }),
        onAuthStateChange: vi.fn((cb: AuthChangeCb) => {
          authChangeCb = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
        signOut: vi.fn().mockResolvedValue({}),
      },
    };
  }

  it("syncs Supabase access_token to session-store", async () => {
    const session = {
      access_token: "supabase-jwt",
      user: { id: "u1", email: "a@b.com", user_metadata: {} },
    };
    const client = mockClient(session);
    const { createSupabaseAuthAdapter } = await import("./supabase");
    const adapter = createSupabaseAuthAdapter(
      client as unknown as import("@supabase/supabase-js").SupabaseClient,
    );

    const snapshots: unknown[] = [];
    adapter.subscribe((s) => snapshots.push(s));

    await vi.waitFor(() => expect(getAccessToken()).toBe("supabase-jwt"));
    expect(
      snapshots.some((s) => (s as { status: string }).status === "signedIn"),
    ).toBe(true);
  });

  it("clears token when session is null", async () => {
    const { setAccessToken } = await import("@/auth/session-store");
    await setAccessToken("stale");

    const client = mockClient(null);
    const { createSupabaseAuthAdapter } = await import("./supabase");
    const adapter = createSupabaseAuthAdapter(
      client as unknown as import("@supabase/supabase-js").SupabaseClient,
    );
    adapter.subscribe(() => {});

    authChangeCb?.("SIGNED_OUT", null);
    await vi.waitFor(() => expect(getAccessToken()).toBeNull());
  });
});
