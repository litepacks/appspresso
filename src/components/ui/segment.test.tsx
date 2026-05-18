import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Segment, SegmentItem } from "./segment";

describe("Segment", () => {
  it("radio role with two options", () => {
    render(
      <Segment defaultValue="a" aria-label="Mode">
        <SegmentItem value="a">A</SegmentItem>
        <SegmentItem value="b">B</SegmentItem>
      </Segment>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("selection changes on click", async () => {
    const user = userEvent.setup();
    render(
      <Segment defaultValue="a">
        <SegmentItem value="a">Left</SegmentItem>
        <SegmentItem value="b">Right</SegmentItem>
      </Segment>,
    );
    await user.click(screen.getByRole("radio", { name: "Right" }));
    expect(screen.getByRole("radio", { name: "Right" })).toBeChecked();
  });

  it("interaction off when disabled", () => {
    render(
      <Segment defaultValue="a" disabled>
        <SegmentItem value="a">Off</SegmentItem>
        <SegmentItem value="b">On</SegmentItem>
      </Segment>,
    );
    expect(screen.getByRole("radio", { name: "Off" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "On" })).toBeDisabled();
  });
});
