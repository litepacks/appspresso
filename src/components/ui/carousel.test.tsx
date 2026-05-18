import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

describe("Carousel", () => {
  const offDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );
  const clientDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "clientWidth",
  );

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 320,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 320,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (offDesc)
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", offDesc);
    if (clientDesc)
      Object.defineProperty(HTMLElement.prototype, "clientWidth", clientDesc);
  });

  it("shows slides", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Bir</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(screen.getByText("Bir")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("Next click scrolls and fires onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Carousel defaultValue={0} onValueChange={onValueChange}>
        <CarouselContent>
          <CarouselItem>1</CarouselItem>
          <CarouselItem>2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    const viewport = container.querySelector(".snap-x") as HTMLDivElement;
    expect(viewport.scrollLeft).toBe(0);
    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /next slide/i }));
    expect(viewport.scrollLeft).toBe(320);
    expect(onValueChange).toHaveBeenCalledWith(1);
  });

  it("Previous disabled on first slide", async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>a</CarouselItem>
          <CarouselItem>b</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /next slide/i }));
    expect(
      screen.getByRole("button", { name: /previous slide/i }),
    ).not.toBeDisabled();
  });
});
