import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("trigger selection and content", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onChange}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute(
      "data-state",
      "active",
    );

    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
  });

  it("controlled value", () => {
    render(
      <Tabs value="x">
        <TabsList>
          <TabsTrigger value="x">X</TabsTrigger>
          <TabsTrigger value="y">Y</TabsTrigger>
        </TabsList>
        <TabsContent value="x">Content X</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Content X");
  });
});
