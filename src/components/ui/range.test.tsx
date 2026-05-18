import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Range, RangeHighlight, RangeThumb, RangeTrack } from "./range";

describe("Range", () => {
  it("renders slider role with first thumb", () => {
    render(
      <Range defaultValue={[40]} max={100} step={1}>
        <RangeTrack>
          <RangeHighlight />
        </RangeTrack>
        <RangeThumb aria-label="Volume" />
      </Range>,
    );
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  });

  it("value updates via keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Range defaultValue={[10]} max={100} step={5} onValueChange={onChange}>
        <RangeTrack>
          <RangeHighlight />
        </RangeTrack>
        <RangeThumb aria-label="Level" />
      </Range>,
    );
    const thumb = screen.getByRole("slider", { name: "Level" });
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual([15]);
  });
});
