import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Countdown,
  formatCountdown,
  msToCountdownParts,
  useCountdown,
} from "./countdown";

function TestTicker(props: Parameters<typeof useCountdown>[0]) {
  const p = useCountdown(props);
  return (
    <span data-testid="parts">
      {p.days},{p.hours},{p.minutes},{p.seconds},{String(p.isComplete)}
    </span>
  );
}

describe("msToCountdownParts / formatCountdown", () => {
  it("treats negative and fractions as 0 complete", () => {
    expect(msToCountdownParts(-100)).toMatchObject({
      totalMs: 0,
      isComplete: true,
    });
    expect(msToCountdownParts(500).seconds).toBe(0);
    expect(msToCountdownParts(1500).seconds).toBe(1);
  });

  it("format: days, hours, minutes", () => {
    expect(formatCountdown(msToCountdownParts(90_061_000))).toMatch(
      /1d.+01:01:01/,
    );
    expect(formatCountdown(msToCountdownParts(3_661_000))).toMatch(/01:01:01/);
    expect(formatCountdown(msToCountdownParts(125_000))).toBe("2:05");
    expect(formatCountdown(msToCountdownParts(0))).toBe("0:00");
  });
});

describe("useCountdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates over time and onComplete once", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));
    const onComplete = vi.fn();
    const endAt = Date.now() + 2000;

    render(
      <TestTicker endAt={endAt} intervalMs={1000} onComplete={onComplete} />,
    );
    expect(screen.getByTestId("parts").textContent).toBe("0,0,0,2,false");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("parts").textContent).toBe("0,0,0,1,false");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("parts").textContent).toBe("0,0,0,0,true");
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("Countdown", () => {
  it("customized via render children", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);
    render(
      <Countdown endAt={1_000_000 + 65_000} now={() => 1_000_000}>
        {(p) => <>{p.minutes}dk</>}
      </Countdown>,
    );
    expect(screen.getByText("1dk")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("aria-label ve tabular-nums", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    render(<Countdown endAt={3700} now={() => 0} data-testid="cd" />);
    const el = screen.getByTestId("cd");
    expect(el.className).toMatch(/tabular-nums/);
    expect(el).toHaveAttribute("aria-live", "polite");
    expect(el.getAttribute("aria-label")).toContain("seconds");
    vi.useRealTimers();
  });
});
