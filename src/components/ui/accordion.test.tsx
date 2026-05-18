import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

describe("Accordion", () => {
  it("expand/collapse content", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="one">
          <AccordionTrigger>Title</AccordionTrigger>
          <AccordionContent>Hidden text</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.queryByText("Hidden text")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Title/i }));
    expect(screen.getByText("Hidden text")).toBeVisible();
  });
});
