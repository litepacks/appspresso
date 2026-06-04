import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BootstrapFailureScreen } from "./BootstrapFailureScreen";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback ?? _k,
  }),
}));

describe("BootstrapFailureScreen", () => {
  it("shows retry and calls onRetry", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<BootstrapFailureScreen error="boot failed" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
