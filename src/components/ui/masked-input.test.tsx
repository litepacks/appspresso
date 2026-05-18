import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MaskedInput } from "./masked-input";

describe("MaskedInput", () => {
  it("phone mask formats digits", async () => {
    const user = userEvent.setup();
    render(
      <MaskedInput
        mask="(000) 000-0000"
        defaultValue=""
        aria-label="Telefon"
      />,
    );
    const el = screen.getByRole("textbox", { name: "Telefon" });
    await user.type(el, "5551234567");
    expect(el).toHaveValue("(555) 123-4567");
  });
});
