import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List, ListItem } from "./list";

describe("List", () => {
  it("ul ve madde", () => {
    const { container } = render(
      <List data-testid="ul">
        <ListItem>bir</ListItem>
      </List>,
    );
    const ul = container.querySelector("ul");
    expect(ul).toBeTruthy();
    expect(ul).toHaveAttribute("data-testid", "ul");
    expect(within(ul as HTMLElement).getByText("bir")).toBeInTheDocument();
  });

  it("ordered ol", () => {
    const { container } = render(
      <List ordered data-testid="ol">
        <ListItem>step</ListItem>
      </List>,
    );
    expect(container.querySelector("ol")).toBeTruthy();
    expect(container.querySelector("ol")?.className).toMatch(/list-decimal/);
  });
});
