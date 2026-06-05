import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { BootstrapStuckDetector } from "./BootstrapStuckDetector";

vi.mock("@/services/appearance.service", () => ({
  hideSplashScreen: vi.fn().mockResolvedValue(undefined),
}));

describe("BootstrapStuckDetector", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows stuck UI after BOOTSTRAP_STUCK_UI_MS in loading phase", () => {
    vi.useFakeTimers();
    const startedAt = performance.now();
    render(
      <BootstrapStuckDetector
        phase="loading"
        error={null}
        startedAt={startedAt}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(10_500);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
  });

  it("hides when phase is ready", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <BootstrapStuckDetector
        phase="loading"
        error={null}
        startedAt={performance.now()}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(
      <BootstrapStuckDetector
        phase="ready"
        error={null}
        startedAt={performance.now()}
      />,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
