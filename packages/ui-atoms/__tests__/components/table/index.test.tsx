import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TablePrimitive,
  TableRow,
  tableRowVariants,
} from "../../../src/components/table/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Table family", () => {
  it("renders the container + every part with the coss slots and classes", () => {
    // TBL-2: wrapperClassName is gone; `render` is the container escape hatch.
    // Base UI's useRender/mergeProps concatenates className between defaultProps
    // and the render element, so the container ends up
    // "relative w-full overflow-x-auto mt-1" — assert with toContain, never toBe.
    render(
      <Table render={<div className="mt-1" />}>
        <TableCaption>Cap</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>H</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-testid="row">
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>F</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const table = screen.getByRole("table");
    expectSlot(table, "table");
    expect(table.className).toContain("caption-bottom");
    const container = table.parentElement as HTMLElement;
    expectSlot(container, "table-container");
    expect(container.className).toContain("overflow-x-auto");
    expect(container.className).toContain("mt-1");
    expect(container).toHaveAttribute("data-variant", "default"); // TBL-1 default
    expectSlot(screen.getByText("Cap"), "table-caption");
    expectSlot(screen.getByText("H"), "table-head");
    expectSlot(screen.getByText("H").closest("thead"), "table-header");
    expectSlot(screen.getByText("C"), "table-cell");
    expectSlot(screen.getByText("C").closest("tbody"), "table-body");
    expectSlot(screen.getByText("F").closest("tfoot"), "table-footer");
    expectSlot(screen.getByTestId("row"), "table-row");
    expect(screen.getByTestId("row").className).toContain(
      "not-in-data-[variant=card]:hover:bg-[color-mix(in_srgb,var(--background),var(--color-black)_2%)]",
    );
  });
  it("TBL-1: variant=card is an explicit prop on the container, not a Frame ancestor", () => {
    render(
      <Table variant="card">
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const container = screen.getByRole("table").parentElement as HTMLElement;
    expect(container).toHaveAttribute("data-variant", "card");
    expect(screen.getByRole("table").className).toContain(
      "in-data-[variant=card]:border-separate",
    );
  });
  it("primitive table has no classes on table or container; variants exported", () => {
    render(<TablePrimitive />);
    const table = screen.getByRole("table");
    expect(table.className).toBe("");
    expect((table.parentElement as HTMLElement).className).toBe("");
    expect(tableRowVariants()).toContain("relative border-b");
    expect(tableRowVariants()).not.toContain("transition-colors");
  });
  it("TBL-2 / TBL-3 are gone from the prop types", () => {
    // Guards the deletions against a future "for compatibility" re-add. vitest does
    // not typecheck, so these bite at `pnpm --filter @tilli.dev/ui-atoms typecheck`,
    // which gates every commit.
    // @ts-expect-error wrapperClassName was dropped with TBL-2 — use `render`.
    render(<Table wrapperClassName="x" />);
    render(
      <Table>
        <TableBody>
          {/* @ts-expect-error the legacy row flags were dropped with TBL-3. */}
          <TableRow isFirstRow={true} isSelected={true}>
            {/* @ts-expect-error the legacy cell flags were dropped with TBL-3. */}
            <TableCell boldFirstColumnCell={true} isFirstCell={true}>
              C
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
  });
});
