import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PullToRefresh } from "./pull-to-refresh";

describe("PullToRefresh", () => {
  it("renders children", () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    render(
      <PullToRefresh onRefresh={onRefresh} statusLabel="Yenileniyor">
        <p>Content</p>
      </PullToRefresh>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
