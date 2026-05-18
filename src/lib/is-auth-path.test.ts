import { describe, expect, it } from "vitest";
import { isAuthLoginPath, isAuthPath } from "@/lib/is-auth-path";

describe("isAuthPath", () => {
  it("matches /auth and /auth/login", () => {
    expect(isAuthPath("/auth")).toBe(true);
    expect(isAuthPath("/auth/login")).toBe(true);
    expect(isAuthPath("/auth/callback/x")).toBe(true);
  });

  it("does not match /author or /authentication", () => {
    expect(isAuthPath("/author")).toBe(false);
    expect(isAuthPath("/authentication")).toBe(false);
    expect(isAuthPath("/")).toBe(false);
  });
});

describe("isAuthLoginPath", () => {
  it("matches login route", () => {
    expect(isAuthLoginPath("/auth/login")).toBe(true);
    expect(isAuthLoginPath("/prefix/auth/login")).toBe(true);
    expect(isAuthLoginPath("/auth/login/")).toBe(true);
  });

  it("does not match /author/login", () => {
    expect(isAuthLoginPath("/author/login")).toBe(false);
  });
});
