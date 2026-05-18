import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { FilesystemProvider } from "./context";
import { useFilesystem } from "./useFilesystem";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <FilesystemProvider config={{ basePath: "test" }}>
      {children}
    </FilesystemProvider>
  );
}

describe("useFilesystem", () => {
  it("throws outside provider", () => {
    expect(() => renderHook(() => useFilesystem())).toThrow(
      /FilesystemProvider/,
    );
  });

  it("exposes config from provider", () => {
    const { result } = renderHook(() => useFilesystem(), { wrapper });
    expect(result.current.config.basePath).toBe("test");
  });
});
