import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Toggle } from "./toggle";

describe("Toggle", () => {
  it("switch role and state", async () => {
    const user = userEvent.setup();
    render(<Toggle aria-label="Bildirimler" />);
    const sw = screen.getByRole("switch", { name: "Bildirimler" });
    expect(sw).toHaveAttribute("data-state", "unchecked");
    await user.click(sw);
    expect(sw).toHaveAttribute("data-state", "checked");
  });
});
