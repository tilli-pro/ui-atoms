"use client";

import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cn } from "../../utils.js";
import { type ButtonProps, buttonVariants } from "../button/index.js";

// coss base `.coss-base/pagination.tsx` @8163481. PAG-1 dissolves with the
// base: the fork imported a `baseButtonVariants` module that did not resolve;
// the base imports `buttonVariants` from the button component, which exists.

const paginationVariants = cva({
  base: "mx-auto flex w-full justify-center",
});

const paginationContentVariants = cva({
  base: "flex flex-row items-center gap-1",
});

const paginationStepVariants = cva({
  base: "max-sm:aspect-square max-sm:p-0",
});

const paginationEllipsisVariants = cva({
  base: "flex min-w-7 justify-center",
});

export type PaginationPrimitiveProps = React.ComponentProps<"nav">;

function PaginationPrimitive(props: PaginationPrimitiveProps) {
  return <nav aria-label="pagination" data-slot="pagination" {...props} />;
}

export type PaginationProps = PaginationPrimitiveProps;

function Pagination({ className, ...props }: PaginationProps) {
  return (
    <PaginationPrimitive
      className={cn(paginationVariants(), className)}
      {...props}
    />
  );
}

export type PaginationContentPrimitiveProps = React.ComponentProps<"ul">;

function PaginationContentPrimitive(props: PaginationContentPrimitiveProps) {
  return <ul data-slot="pagination-content" {...props} />;
}

export type PaginationContentProps = PaginationContentPrimitiveProps;

function PaginationContent({ className, ...props }: PaginationContentProps) {
  return (
    <PaginationContentPrimitive
      className={cn(paginationContentVariants(), className)}
      {...props}
    />
  );
}

export type PaginationItemProps = React.ComponentProps<"li">;

function PaginationItem(props: PaginationItemProps) {
  return <li data-slot="pagination-item" {...props} />;
}

export interface PaginationLinkPrimitiveProps
  extends useRender.ComponentProps<"a"> {
  isActive?: boolean;
}

function PaginationLinkPrimitive({
  isActive,
  render,
  ...props
}: PaginationLinkPrimitiveProps) {
  const defaultProps = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-active": isActive,
    "data-slot": "pagination-link",
  } as PaginationLinkPrimitiveProps;

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(defaultProps, props),
    render,
  });
}

export interface PaginationLinkProps extends PaginationLinkPrimitiveProps {
  size?: ButtonProps["size"];
}

/** A caller-supplied `render` opts out of the button chrome, as in the base. */
function PaginationLink({
  className,
  isActive,
  render,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <PaginationLinkPrimitive
      className={
        render
          ? className
          : cn(
              buttonVariants({
                size,
                variant: isActive ? "outline" : "ghost",
              }),
              className,
            )
      }
      isActive={isActive}
      render={render}
      {...props}
    />
  );
}

export type PaginationPreviousProps = PaginationLinkProps;

function PaginationPrevious({ className, ...props }: PaginationPreviousProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn(paginationStepVariants(), className)}
      size="default"
      {...props}
    >
      <ChevronLeftIcon className="sm:-ms-1" />
      <span className="max-sm:hidden">Previous</span>
    </PaginationLink>
  );
}

export type PaginationNextProps = PaginationLinkProps;

function PaginationNext({ className, ...props }: PaginationNextProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn(paginationStepVariants(), className)}
      size="default"
      {...props}
    >
      <span className="max-sm:hidden">Next</span>
      <ChevronRightIcon className="sm:-me-1" />
    </PaginationLink>
  );
}

export type PaginationEllipsisPrimitiveProps = React.ComponentProps<"span">;

function PaginationEllipsisPrimitive(props: PaginationEllipsisPrimitiveProps) {
  return (
    <span aria-hidden={true} data-slot="pagination-ellipsis" {...props}>
      <MoreHorizontalIcon className="size-5 sm:size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export type PaginationEllipsisProps = PaginationEllipsisPrimitiveProps;

function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
  return (
    <PaginationEllipsisPrimitive
      className={cn(paginationEllipsisVariants(), className)}
      {...props}
    />
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationContentPrimitive,
  PaginationEllipsis,
  PaginationEllipsisPrimitive,
  PaginationItem,
  PaginationLink,
  PaginationLinkPrimitive,
  PaginationNext,
  PaginationPrevious,
  PaginationPrimitive,
  paginationContentVariants,
  paginationEllipsisVariants,
  paginationStepVariants,
  paginationVariants,
};
