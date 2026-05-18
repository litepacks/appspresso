import { render, screen } from "@testing-library/react";
import { Button } from "appspresso/components/ui/button";
import { describe, expect, it } from "vitest";

describe("appspresso component (dist-lib)", () => {
  it("shows Button label", () => {
    render(<Button type="button">Library UI</Button>);
    expect(
      screen.getByRole("button", { name: "Library UI" }),
    ).toBeInTheDocument();
  });
});
