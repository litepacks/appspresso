import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders with checkbox role", () => {
    render(<Checkbox aria-label="Accept" />);
    expect(
      screen.getByRole("checkbox", { name: "Accept" }),
    ).toBeInTheDocument();
  });

  it("checks on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Toggle" />);
    const cb = screen.getByRole("checkbox", { name: "Toggle" });
    expect(cb).not.toBeChecked();
    await user.click(cb);
    expect(cb).toBeChecked();
  });
});
