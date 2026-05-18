import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";
import { Label } from "./label";

describe("Label", () => {
  it("links input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="uid">Label</Label>
        <Input id="uid" />
      </>,
    );
    const input = document.getElementById("uid");
    expect(input).toBeInTheDocument();
    expect(screen.getByLabelText("Label")).toBe(input);
  });
});
