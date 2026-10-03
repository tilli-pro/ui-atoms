"use client";

import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { cn } from "../../utils.js";

// Every part below is the same styled/primitive/variants triple over the coss base: an unstyled
// `<Part>Primitive` that only carries the `data-slot`, the base's class string
// as `table<Part>Variants`, and the styled `<Part>`.
//
// TBL-1: the card look is an explicit `variant` on the container instead of the
// old `in-data-[slot=frame]:` coupling to an invisible ancestor. It reaches the
// parts through the container's `data-variant` attribute, which is why the part
// class strings below are full of `in-data-[variant=card]:` — so the cva for a
// part carries no `variant` key of its own; the whole distinction lives in CSS,
// exactly as in the base.
// TBL-2: `wrapperClassName` is gone — `render` re-tags the container and
// `containerProps` is the seam the split needs (the container element lives
// inside `TablePrimitive`, so the styled `Table` has to reach it somehow).
// TBL-3: the seven single-consumer row/cell flags are gone from the prop
// types.

export type TableVariant = "default" | "card";

export interface TablePrimitiveProps extends React.ComponentProps<"table"> {
  variant?: TableVariant;
  render?: useRender.ComponentProps<"div">["render"];
  /** Props for the scroll container that wraps the `<table>`. */
  containerProps?: React.ComponentProps<"div">;
}

function TablePrimitive({
  variant = "default",
  render,
  containerProps,
  ...props
}: TablePrimitiveProps) {
  const defaultProps = {
    children: <table data-slot="table" {...props} />,
    "data-slot": "table-container",
    "data-variant": variant,
  } as useRender.ComponentProps<"div">;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, containerProps ?? {}),
    render,
  });
}

const tableContainerVariants = cva({
  base: "relative w-full overflow-x-auto",
});

const tableVariants = cva({
  base: "w-full caption-bottom in-data-[variant=card]:border-separate in-data-[variant=card]:border-spacing-0 text-sm",
});

export type TableProps = TablePrimitiveProps;

function Table({ className, containerProps, ...props }: TableProps) {
  return (
    <TablePrimitive
      className={cn(tableVariants(), className)}
      containerProps={{
        ...containerProps,
        className: cn(tableContainerVariants(), containerProps?.className),
      }}
      {...props}
    />
  );
}

export type TableHeaderPrimitiveProps = React.ComponentProps<"thead">;

function TableHeaderPrimitive(props: TableHeaderPrimitiveProps) {
  return <thead data-slot="table-header" {...props} />;
}

const tableHeaderVariants = cva({ base: "[&_tr]:border-b" });

export type TableHeaderProps = TableHeaderPrimitiveProps;

function TableHeader({ className, ...props }: TableHeaderProps) {
  return (
    <TableHeaderPrimitive
      className={cn(tableHeaderVariants(), className)}
      {...props}
    />
  );
}

export type TableBodyPrimitiveProps = React.ComponentProps<"tbody">;

function TableBodyPrimitive(props: TableBodyPrimitiveProps) {
  return <tbody data-slot="table-body" {...props} />;
}

const tableBodyVariants = cva({
  base: "relative in-data-[variant=card]:rounded-xl in-data-[variant=card]:shadow-xs/5 before:pointer-events-none before:absolute before:inset-px not-in-data-[variant=card]:before:hidden before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/8%)] [&_tr:last-child]:border-0 in-data-[variant=card]:*:[tr]:border-0 in-data-[variant=card]:*:[tr]:*:[td]:border-b in-data-[variant=card]:*:[tr]:*:[td]:bg-card in-data-[variant=card]:*:[tr]:first:*:[td]:first:rounded-ss-xl in-data-[variant=card]:*:[tr]:*:[td]:first:border-s in-data-[variant=card]:*:[tr]:first:*:[td]:border-t in-data-[variant=card]:*:[tr]:last:*:[td]:last:rounded-ee-xl in-data-[variant=card]:*:[tr]:*:[td]:last:border-e in-data-[variant=card]:*:[tr]:first:*:[td]:last:rounded-se-xl in-data-[variant=card]:*:[tr]:last:*:[td]:first:rounded-es-xl in-data-[variant=card]:*:[tr]:hover:*:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_2%)] in-data-[variant=card]:*:[tr]:data-[state=selected]:*:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_4%)] dark:in-data-[variant=card]:*:[tr]:data-[state=selected]:*:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_4%)] dark:in-data-[variant=card]:*:[tr]:hover:*:[td]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_2%)]",
});

export type TableBodyProps = TableBodyPrimitiveProps;

function TableBody({ className, ...props }: TableBodyProps) {
  return (
    <TableBodyPrimitive
      className={cn(tableBodyVariants(), className)}
      {...props}
    />
  );
}

export type TableFooterPrimitiveProps = React.ComponentProps<"tfoot">;

function TableFooterPrimitive(props: TableFooterPrimitiveProps) {
  return <tfoot data-slot="table-footer" {...props} />;
}

const tableFooterVariants = cva({
  base: "border-t in-data-[variant=card]:border-none bg-transparent not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--card),var(--color-black)_2%)] font-medium dark:not-in-data-[variant=card]:bg-[color-mix(in_srgb,var(--card),var(--color-white)_2%)] [&>tr]:last:border-b-0",
});

export type TableFooterProps = TableFooterPrimitiveProps;

function TableFooter({ className, ...props }: TableFooterProps) {
  return (
    <TableFooterPrimitive
      className={cn(tableFooterVariants(), className)}
      {...props}
    />
  );
}

export type TableRowPrimitiveProps = React.ComponentProps<"tr">;

function TableRowPrimitive(props: TableRowPrimitiveProps) {
  return <tr data-slot="table-row" {...props} />;
}

const tableRowVariants = cva({
  base: "relative border-b not-in-data-[variant=card]:hover:bg-[color-mix(in_srgb,var(--background),var(--color-black)_2%)] not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-black)_4%)] dark:not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-white)_4%)] dark:not-in-data-[variant=card]:hover:bg-[color-mix(in_srgb,var(--background),var(--color-white)_2%)]",
});

export type TableRowProps = TableRowPrimitiveProps;

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <TableRowPrimitive
      className={cn(tableRowVariants(), className)}
      {...props}
    />
  );
}

export type TableHeadPrimitiveProps = React.ComponentProps<"th">;

function TableHeadPrimitive(props: TableHeadPrimitiveProps) {
  return <th data-slot="table-head" {...props} />;
}

const tableHeadVariants = cva({
  base: "h-10 whitespace-nowrap px-2.5 text-left align-middle font-medium text-muted-foreground leading-none has-[[role=checkbox]]:w-px last:has-[[role=checkbox]]:ps-0 first:has-[[role=checkbox]]:pe-0",
});

export type TableHeadProps = TableHeadPrimitiveProps;

function TableHead({ className, ...props }: TableHeadProps) {
  return (
    <TableHeadPrimitive
      className={cn(tableHeadVariants(), className)}
      {...props}
    />
  );
}

export type TableCellPrimitiveProps = React.ComponentProps<"td">;

function TableCellPrimitive(props: TableCellPrimitiveProps) {
  return <td data-slot="table-cell" {...props} />;
}

const tableCellVariants = cva({
  base: "whitespace-nowrap bg-clip-padding p-2.5 in-data-[slot=table-footer]:py-3.5 align-middle leading-none in-data-[variant=card]:first:ps-[calc(--spacing(2.5)-1px)] in-data-[variant=card]:last:pe-[calc(--spacing(2.5)-1px)] has-[[role=checkbox]]:w-px last:has-[[role=checkbox]]:ps-0 first:has-[[role=checkbox]]:pe-0",
});

export type TableCellProps = TableCellPrimitiveProps;

function TableCell({ className, ...props }: TableCellProps) {
  return (
    <TableCellPrimitive
      className={cn(tableCellVariants(), className)}
      {...props}
    />
  );
}

export type TableCaptionPrimitiveProps = React.ComponentProps<"caption">;

function TableCaptionPrimitive(props: TableCaptionPrimitiveProps) {
  return <caption data-slot="table-caption" {...props} />;
}

const tableCaptionVariants = cva({
  base: "in-data-[variant=card]:my-4 mt-4 text-muted-foreground text-sm",
});

export type TableCaptionProps = TableCaptionPrimitiveProps;

function TableCaption({ className, ...props }: TableCaptionProps) {
  return (
    <TableCaptionPrimitive
      className={cn(tableCaptionVariants(), className)}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableBodyPrimitive,
  TableCaption,
  TableCaptionPrimitive,
  TableCell,
  TableCellPrimitive,
  TableFooter,
  TableFooterPrimitive,
  TableHead,
  TableHeader,
  TableHeaderPrimitive,
  TableHeadPrimitive,
  TablePrimitive,
  TableRow,
  TableRowPrimitive,
  tableBodyVariants,
  tableCaptionVariants,
  tableCellVariants,
  tableContainerVariants,
  tableFooterVariants,
  tableHeaderVariants,
  tableHeadVariants,
  tableRowVariants,
  tableVariants,
};
