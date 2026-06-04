import { afterEach, describe, expect, it, vi } from "vitest";
import { clearSession, getAccessToken } from "@/auth/session-store";

const listeners: Array<(u: unknown) => void> = [];

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (u: unknown) => void) => {
    listeners.push(cb);
    return () => {};
  }),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
}));

describe("createFirebaseAuthAdapter", () => {
  afterEach(async () => {
    listeners.length = 0;
    sessionStorage.clear();
    await clearSession();
    vi.clearAllMocks();
  });

  it("syncs Firebase ID token to session-store on sign-in", async () => {
    const { createFirebaseAuthAdapter } = await import("./firebase");
    const auth = {} as import("firebase/auth").Auth;
    const adapter = createFirebaseAuthAdapter(auth);

    const snapshots: unknown[] = [];
    adapter.subscribe((s) => snapshots.push(s));

    const user = {
      uid: "u1",
      displayName: "Test",
      email: "t@example.com",
      getIdToken: vi.fn().mockResolvedValue("firebase-jwt"),
    };
    listeners[0]?.(user);
    await vi.waitFor(() => expect(getAccessToken()).toBe("firebase-jwt"));

    expect(snapshots[0]).toEqual(
      expect.objectContaining({
        status: "signedIn",
        user: expect.objectContaining({ id: "u1" }),
      }),
    );
  });

  it("clears session-store on sign-out", async () => {
    const { createFirebaseAuthAdapter } = await import("./firebase");
    const { setAccessToken } = await import("@/auth/session-store");
    await setAccessToken("old");

    const adapter = createFirebaseAuthAdapter(
      {} as import("firebase/auth").Auth,
    );
    adapter.subscribe(() => {});

    listeners[0]?.(null);
    await vi.waitFor(() => expect(getAccessToken()).toBeNull());
  });
});
