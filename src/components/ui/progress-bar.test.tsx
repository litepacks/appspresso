import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("progressbar role and aria values", () => {
    render(<ProgressBar value={35} max={100} aria-label="Loading" />);
    const el = screen.getByRole("progressbar", { name: "Loading" });
    expect(el).toHaveAttribute("aria-valuenow", "35");
    expect(el).toHaveAttribute("aria-valuemax", "100");
    expect(el).toHaveAttribute("aria-valuetext", "35%");
  });

  it("indeterminate modda aria-valuenow olmaz, aria-busy", () => {
    render(<ProgressBar indeterminate aria-label="Processing" />);
    const el = screen.getByRole("progressbar", { name: "Processing" });
    expect(el).not.toHaveAttribute("aria-valuenow");
    expect(el).toHaveAttribute("aria-busy", "true");
  });
});
