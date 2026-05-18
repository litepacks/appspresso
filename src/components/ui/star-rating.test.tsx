import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("read-only: img role and summary label", () => {
    render(<StarRating value={3} label="Rating" max={5} />);
    expect(
      screen.getByRole("img", { name: /Rating: 3 of 5 stars/i }),
    ).toBeInTheDocument();
  });

  it("read-only: shows decimal value in label", () => {
    render(<StarRating value={3.7} max={5} />);
    expect(
      screen.getByRole("img", { name: /3\.7 of 5 stars/i }),
    ).toBeInTheDocument();
  });

  it("interactive: onChange on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StarRating value={0} max={5} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "4 of 5 stars" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("no buttons when disabled (read-only)", () => {
    const onChange = vi.fn();
    render(<StarRating value={2} max={5} onChange={onChange} disabled />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
