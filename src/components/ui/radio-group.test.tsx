import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("group has multiple radio roles", () => {
    render(
      <RadioGroup defaultValue="b" aria-label="Pick">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="a" id="ra" />
          <Label htmlFor="ra">A</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="b" id="rb" />
          <Label htmlFor="rb">B</Label>
        </div>
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it("selection changes", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="x" aria-label="Choice">
        <div className="flex gap-2">
          <RadioGroupItem value="x" id="rx" />
          <Label htmlFor="rx">X</Label>
        </div>
        <div className="flex gap-2">
          <RadioGroupItem value="y" id="ry" />
          <Label htmlFor="ry">Y</Label>
        </div>
      </RadioGroup>,
    );
    await user.click(screen.getByRole("radio", { name: "Y" }));
    expect(screen.getByRole("radio", { name: "Y" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "X" })).not.toBeChecked();
  });
});
