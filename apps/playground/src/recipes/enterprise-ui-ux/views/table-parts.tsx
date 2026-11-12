import { Button, buttonVariants } from "@tilli.dev/ui-atoms/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tilli.dev/ui-atoms/pagination";
import { TableHead } from "@tilli.dev/ui-atoms/table";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { ArrowUpDown } from "lucide-react";
import { pageWindow } from "./list-state.js";

/** A column header: a sort button unless the column opts out with `sortable: false`. */
export function SortableHead({
  column,
  label,
  onSort,
}: {
  column: { key: string; align?: "start" | "end"; sortable?: boolean };
  label: string;
  onSort: (key: string) => void;
}) {
  return (
    <TableHead className={cn(column.align === "end" && "text-end")}>
      {column.sortable === false ? (
        label
      ) : (
        <Button onClick={() => onSort(column.key)} size="xs" variant="ghost">
          {label}
          <ArrowUpDown />
        </Button>
      )}
    </TableHead>
  );
}

export function ListPagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={page === 1}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            onClick={() => onPage(Math.max(page - 1, 1))}
            render={
              <button
                className={buttonVariants({
                  size: "default",
                  variant: "ghost",
                })}
                disabled={page === 1}
                type="button"
              />
            }
          />
        </PaginationItem>
        {pageWindow(page, pageCount).map((n) => (
          <PaginationItem key={n}>
            <PaginationLink
              isActive={n === page}
              onClick={() => onPage(n)}
              render={
                <button
                  className={buttonVariants({
                    size: "icon",
                    variant: n === page ? "outline" : "ghost",
                  })}
                  type="button"
                />
              }
            >
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            aria-disabled={page === pageCount}
            className={cn(
              page === pageCount && "pointer-events-none opacity-50",
            )}
            onClick={() => onPage(Math.min(page + 1, pageCount))}
            render={
              <button
                className={buttonVariants({
                  size: "default",
                  variant: "ghost",
                })}
                disabled={page === pageCount}
                type="button"
              />
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
