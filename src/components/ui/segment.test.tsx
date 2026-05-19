import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segment, SegmentItem } from "./segment";

describe("Segment", () => {
  it("renders items and selects on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Segment defaultValue="a" onValueChange={onChange}>
        <SegmentItem value="a">A</SegmentItem>
        <SegmentItem value="b">B</SegmentItem>
      </Segment>,
    );
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("applies vertical orientation class", () => {
    render(
      <Segment orientation="vertical" aria-label="tabs">
        <SegmentItem value="x">X</SegmentItem>
      </Segment>,
    );
    expect(screen.getByRole("radiogroup", { name: "tabs" }).className).toMatch(
      /flex-col/,
    );
  });
});
