import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "@/auth/context";
import { useAuth } from "@/auth/useAuth";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });

  it("signIn and signOut update user and status", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("signedOut");
    });

    await act(async () => {
      await result.current.signIn();
    });
    await waitFor(() => {
      expect(result.current.status).toBe("signedIn");
    });
    expect(result.current.user?.id).toBe("demo");

    await act(async () => {
      await result.current.signOut();
    });
    await waitFor(() => {
      expect(result.current.status).toBe("signedOut");
    });
    expect(result.current.user).toBeNull();
  });
});
