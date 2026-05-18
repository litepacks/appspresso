import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("renders with search role and placeholder", () => {
    render(<SearchInput placeholder="Find..." aria-label="Find items" />);
    expect(
      screen.getByRole("searchbox", { name: "Find items" }),
    ).toHaveAttribute("placeholder", "Find...");
  });

  it("binds datalist and list with suggestions", () => {
    const { container } = render(
      <SearchInput
        aria-label="Arama"
        suggestions={["elma", "armut"]}
        datalistId="test-search-dl"
      />,
    );
    const input = screen.getByLabelText("Arama");
    expect(input).toHaveAttribute("list", "test-search-dl");
    const dl = container.querySelector("#test-search-dl");
    expect(dl?.tagName).toBe("DATALIST");
    expect(dl?.querySelectorAll("option")).toHaveLength(2);
  });
});
