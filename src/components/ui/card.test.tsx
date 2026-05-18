import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
  it("compound structure and title", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Alt</CardFooter>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toMatch(/rounded-2xl/);
    expect(screen.getByText("Title").tagName).toBe("H3");
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Alt")).toBeInTheDocument();
  });
});
