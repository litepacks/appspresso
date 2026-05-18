import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppContent, AppHeader, AppPage, AppToolbar } from "@/components/shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Fab } from "@/components/ui/fab";

describe("App shell", () => {
  it("render AppPage tree with toolbar title", () => {
    render(
      <AppPage>
        <AppHeader>
          <AppToolbar title="Shell demo" />
        </AppHeader>
        <AppContent>
          <p>body</p>
        </AppContent>
      </AppPage>,
    );
    expect(screen.getByText("Shell demo")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});

describe("Accordion", () => {
  it("opens panel on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="a">
          <AccordionTrigger>Topic</AccordionTrigger>
          <AccordionContent>Details</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /topic/i }));
    expect(screen.getByText("Details")).toBeVisible();
  });
});

describe("Fab", () => {
  it("renders as button with accessible name", () => {
    render(
      <Fab type="button" aria-label="Add item">
        +
      </Fab>,
    );
    expect(
      screen.getByRole("button", { name: "Add item" }),
    ).toBeInTheDocument();
  });

  it("bottomNavigation clearance adds extra bottom padding on wrapper", () => {
    const { container } = render(
      <Fab type="button" aria-label="Add" clearance="bottomNavigation">
        +
      </Fab>,
    );
    const root = container.querySelector("[data-fab-root]");
    expect(root).toBeTruthy();
    expect(root?.className).toMatch(/calc\(4rem/);
  });
});
