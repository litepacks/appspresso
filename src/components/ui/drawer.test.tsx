import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerMenuItem,
  DrawerProfileHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

describe("Drawer", () => {
  it("shows title and description via portal when open", async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen={false}>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent side="right" aria-label="Test drawer">
          <DrawerHeader>
            <DrawerTitle>Panel</DrawerTitle>
            <DrawerDescription>Secondary text</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <span>Actions</span>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain("max-w-md");
    expect(dialog.getAttribute("data-layout")).toBe("panel");
    expect(screen.getByText("Panel")).toBeVisible();
    expect(screen.getByText("Secondary text")).toBeInTheDocument();
  });

  it("layout nav full height and profile menu", async () => {
    const user = userEvent.setup();
    const onStatus = vi.fn();
    render(
      <Drawer defaultOpen={false}>
        <DrawerTrigger>Open nav</DrawerTrigger>
        <DrawerContent layout="nav" side="left" aria-label="Navigation">
          <DrawerProfileHeader
            title="Mobbin"
            subtitle="Mobbin Design"
            avatar={<span aria-hidden>M</span>}
          />
          <DrawerMenuItem icon={<span aria-hidden>@</span>} onClick={onStatus}>
            Set a status
          </DrawerMenuItem>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open nav" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-layout")).toBe("nav");
    expect(dialog.className).toContain("rounded-none");
    expect(screen.getByText("Mobbin")).toBeVisible();
    expect(screen.getByText("Mobbin Design")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Set a status" }));
    expect(onStatus).toHaveBeenCalled();
  });

  it("applies max-w-full when contentWidth is full", async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen={false}>
        <DrawerTrigger>Open wide</DrawerTrigger>
        <DrawerContent
          side="right"
          contentWidth="full"
          aria-label="Wide drawer"
        >
          <DrawerHeader>
            <DrawerTitle>Wide</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>,
    );

    await user.click(screen.getByRole("button", { name: "Open wide" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog.className).toContain("max-w-full");
  });
});
