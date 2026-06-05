import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BOOTSTRAP_DEADLINE_MS } from "@/lib/bootstrap-timing";
import { useAppspressoBootstrapState } from "./useAppspressoBootstrap";

const runBootstrap = vi.hoisted(() => vi.fn());
const runDeferredNativeBootstrap = vi.hoisted(() => vi.fn());

vi.mock("@/app/bootstrap", () => ({
  runBootstrap,
  runDeferredNativeBootstrap,
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => false },
}));

vi.mock("@/lib/splash-bootstrap", () => ({
  getSplashBootstrapTiming: () => ({
    minDisplayMs: 0,
    exitDurationMs: 0,
    webPublicPath: undefined,
    webAnimation: "none",
    backgroundColor: "#000",
  }),
  delay: (ms: number) => new Promise((r) => setTimeout(r, ms)),
}));

function Probe() {
  const { phase, error, retry } = useAppspressoBootstrapState();
  return (
    <div>
      <span data-testid="phase">{phase}</span>
      {error ? <span data-testid="error">{error}</span> : null}
      <button type="button" onClick={retry}>
        retry
      </button>
    </div>
  );
}

describe("useAppspressoBootstrapState", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reaches ready when runBootstrap succeeds", async () => {
    runBootstrap.mockResolvedValue(undefined);
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("phase").textContent).toBe("ready"),
    );
  });

  it("surfaces failed phase when runBootstrap throws", async () => {
    runBootstrap.mockRejectedValue(new Error("boot fail"));
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("phase").textContent).toBe("failed"),
    );
    expect(screen.getByTestId("error").textContent).toContain("boot fail");
  });

  it("fails when runBootstrap exceeds deadline", async () => {
    vi.useFakeTimers();
    runBootstrap.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        }),
    );
    render(<Probe />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(BOOTSTRAP_DEADLINE_MS + 50);
    });
    expect(screen.getByTestId("phase").textContent).toBe("failed");
    expect(screen.getByTestId("error").textContent).toContain("timed out");
  });

  it("retry re-runs bootstrap after failure", async () => {
    runBootstrap
      .mockRejectedValueOnce(new Error("first"))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<Probe />);
    await waitFor(() =>
      expect(screen.getByTestId("phase").textContent).toBe("failed"),
    );
    await user.click(screen.getByRole("button", { name: "retry" }));
    await waitFor(() =>
      expect(screen.getByTestId("phase").textContent).toBe("ready"),
    );
    expect(runBootstrap.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
