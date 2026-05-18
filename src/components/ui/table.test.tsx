import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

describe("Table", () => {
  it("structure and caption", () => {
    render(
      <Table data-testid="tbl">
        <TableCaption>Summary</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>A</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    const wrap = screen.getByTestId("tbl").closest("div");
    expect(wrap?.className).toMatch(/overflow-x-auto/);
    const table = screen.getByRole("table");
    expect(within(table).getByText("Summary")).toBeInTheDocument();
    expect(within(table).getByText("A")).toBeInTheDocument();
    expect(within(table).getByText("1")).toBeInTheDocument();
  });
});
