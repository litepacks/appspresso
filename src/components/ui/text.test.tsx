import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./text";

describe("Text", () => {
  it("default p and body class", () => {
    render(<Text>Snippet</Text>);
    const el = screen.getByText("Snippet");
    expect(el.tagName).toBe("P");
    expect(el.className).toMatch(/text-base/);
  });

  it("as ve variant", () => {
    render(
      <Text as="h2" variant="headline" data-testid="t">
        Title
      </Text>,
    );
    const el = screen.getByTestId("t");
    expect(el.tagName).toBe("H2");
    expect(el.className).toMatch(/text-2xl/);
  });
});
