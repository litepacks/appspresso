import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("default type=button", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("variant classes", () => {
    render(
      <Button variant="destructive" data-testid="b">
        Delete
      </Button>,
    );
    expect(screen.getByTestId("b").className).toMatch(/destructive/);
  });

  it("renders anchor with to", () => {
    render(<Button to="https://example.com/test">Go</Button>);
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "https://example.com/test");
  });

  it("disabled is not clickable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        X
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "X" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("asChild passes classes to child", () => {
    render(
      <Button asChild>
        <span data-testid="slot">Label</span>
      </Button>,
    );
    const el = screen.getByTestId("slot");
    expect(el.className).toMatch(/rounded-full/);
    expect(el).toHaveTextContent("Label");
  });
});
