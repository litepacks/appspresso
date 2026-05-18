import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("basic input and class merge", () => {
    render(<Input data-testid="in" placeholder="Type" className="max-w-xs" />);
    const el = screen.getByTestId("in");
    expect(el).toHaveAttribute("placeholder", "Type");
    expect(el.className).toMatch(/rounded-full/);
    expect(el.className).toMatch(/max-w-xs/);
  });

  it("value is writable", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" defaultValue="" />);
    const el = screen.getByRole("textbox", { name: "Name" });
    await user.type(el, "Ali");
    expect(el).toHaveValue("Ali");
  });
});
