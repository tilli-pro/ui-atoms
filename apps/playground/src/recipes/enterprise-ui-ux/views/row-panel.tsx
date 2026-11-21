import { useMemo, useState } from "react";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPopup,
  SheetTitle,
} from "@tilli.dev/ui-atoms/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tilli.dev/ui-atoms/table";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { Cell } from "./cells.js";
import { readValue } from "./list-state.js";
import type { ActionSpec, PanelContent, Persona, Row } from "../specs/types.js";

/** The Sheet a `panel` row action opens: a compact table of the row's nested rows. */
export function RowPanel<R extends Row>({
  panel,
  persona,
  onClose,
}: {
  panel: { row: R; action: ActionSpec<R> } | null;
  persona: Persona;
  onClose: () => void;
}) {
  // Keep the last content while the Sheet animates out.
  const [last, setLast] = useState<PanelContent | null>(null);
  const content = useMemo(
    () => (panel ? (panel.action.panel?.(panel.row) ?? null) : null),
    [panel],
  );
  if (content && content !== last) setLast(content);
  const shown = content ?? last;
  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      open={panel !== null}
    >
      <SheetPopup className="sm:max-w-2xl" side="right">
        <SheetHeader>
          <SheetTitle>{shown?.title}</SheetTitle>
          {shown?.description ? (
            <SheetDescription>{shown.description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
          {shown ? (
            <Table variant="card">
              <TableHeader>
                <TableRow>
                  {shown.columns.map((column) => (
                    <TableHead
                      className={cn(column.align === "end" && "text-end")}
                      key={column.key}
                    >
                      {typeof column.header === "function"
                        ? column.header(persona.terms)
                        : column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.rows.map((row) => (
                  <TableRow key={row.id}>
                    {shown.columns.map((column) => (
                      <TableCell
                        className={cn(column.align === "end" && "text-end")}
                        key={column.key}
                      >
                        <Cell
                          currency={persona.currency}
                          format={column.format}
                          value={readValue(column, row)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </div>
      </SheetPopup>
    </Sheet>
  );
}
