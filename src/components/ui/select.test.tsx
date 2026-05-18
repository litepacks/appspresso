import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Select", () => {
  it("option selectable when open", async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="a">
        <SelectTrigger aria-label="Demo select">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Bravo</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(
      screen.getByRole("combobox", { name: "Demo select" }),
    ).toHaveTextContent("Alpha");

    await user.click(screen.getByRole("combobox", { name: "Demo select" }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: "Bravo" }));

    expect(
      screen.getByRole("combobox", { name: "Demo select" }),
    ).toHaveTextContent("Bravo");
  });
});
