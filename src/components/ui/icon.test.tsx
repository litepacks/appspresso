import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

describe("Icon", () => {
  it("known name: svg and title accessibility", () => {
    render(<Icon name="home" title="Ana sayfa" />);
    expect(screen.getByRole("img", { name: "Ana sayfa" })).toBeInTheDocument();
  });
});
