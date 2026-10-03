"use client";

import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";
import { Separator, type SeparatorProps } from "../separator/index.js";

// coss base `.coss-base/group.tsx` @8163481. No divergence id and no tilli lead
// touches this component, and `group` is not one of the fourteen the size-ramp
// hold-back names, so every class string is the base's verbatim.

const groupVariants = cva({
  base: "flex w-fit *:focus-visible:z-1 has-[>[data-slot=group]]:gap-2 *:has-focus-visible:z-1 dark:*:[[data-slot=separator]:has(~button:hover):not(:has(~[data-slot=separator]~[data-slot]:hover)),[data-slot=separator]:has(~[data-slot][data-pressed]):not(:has(~[data-slot=separator]~[data-slot][data-pressed]))]:before:bg-input/64 dark:*:[button:hover~[data-slot=separator]:not([data-slot]:hover~[data-slot=separator]~[data-slot=separator]),[data-slot][data-pressed]~[data-slot=separator]:not([data-slot][data-pressed]~[data-slot=separator]~[data-slot=separator])]:before:bg-input/64",
  defaultVariants: { orientation: "horizontal" },
  variants: {
    orientation: {
      horizontal:
        "*:pointer-coarse:after:min-w-auto *:data-slot:has-[~[data-slot]]:rounded-e-none *:data-slot:has-[~[data-slot]]:border-e-0 *:data-slot:not-data-[slot=separator]:has-[~[data-slot]]:before:-end-[0.5px] *:data-slot:has-[~[data-slot]]:before:rounded-e-none *:[[data-slot]~[data-slot]:not([data-slot=separator])]:before:-start-[0.5px] *:[[data-slot]~[data-slot]]:rounded-s-none *:[[data-slot]~[data-slot]]:border-s-0 *:[[data-slot]~[data-slot]]:before:rounded-s-none",
      vertical:
        "flex-col *:pointer-coarse:after:min-h-auto *:data-slot:has-[~[data-slot]]:rounded-b-none *:data-slot:has-[~[data-slot]]:border-b-0 *:data-slot:not-data-[slot=separator]:has-[~[data-slot]]:before:-bottom-[0.5px] *:data-slot:not-data-[slot=separator]:has-[~[data-slot]]:before:hidden *:data-slot:has-[~[data-slot]]:before:rounded-b-none dark:*:last:before:hidden dark:*:first:before:block *:[[data-slot]~[data-slot]:not([data-slot=separator])]:before:-top-[0.5px] *:[[data-slot]~[data-slot]]:rounded-t-none *:[[data-slot]~[data-slot]]:border-t-0 *:[[data-slot]~[data-slot]]:before:rounded-t-none",
    },
  },
});

const groupTextVariants = cva({
  base: "relative inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-input bg-muted not-dark:bg-clip-padding px-[calc(--spacing(3)-1px)] text-base text-muted-foreground shadow-xs/5 outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/6%)] sm:text-sm dark:bg-input/64 dark:before:shadow-[0_-1px_--theme(--color-white/6%)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5 [&_svg]:shrink-0",
});

const groupSeparatorVariants = cva({
  base: "pointer-events-none relative z-2 bg-input before:absolute before:inset-0 has-[+[data-slot=input-control]:focus-within,+[data-slot=input-group]:focus-within,+[data-slot=select-trigger]:focus-visible+*,+[data-slot=number-field]:focus-within]:translate-x-px has-[+[data-slot=input-control]:focus-within,+[data-slot=input-group]:focus-within,+[data-slot=select-trigger]:focus-visible+*,+[data-slot=number-field]:focus-within]:bg-ring dark:before:bg-input/32 [[data-slot=input-control]:focus-within+&,[data-slot=input-group]:focus-within+&,[data-slot=select-trigger]:focus-visible+*+&,[data-slot=number-field]:focus-within+&,[data-slot=number-field]:focus-within+input+&]:bg-ring [[data-slot=input-control]:focus-within+&,[data-slot=input-group]:focus-within+&,[data-slot=select-trigger]:focus-visible+*+&,[data-slot=number-field]:focus-within+input+&]:-translate-x-px",
});

export interface GroupPrimitiveProps extends React.ComponentProps<"div"> {
  orientation?: VariantProps<typeof groupVariants>["orientation"];
}

function GroupPrimitive({ orientation, ...props }: GroupPrimitiveProps) {
  return (
    <div
      data-orientation={orientation}
      data-slot="group"
      role="group"
      {...props}
    />
  );
}

export type GroupProps = GroupPrimitiveProps;

function Group({ className, orientation, ...props }: GroupProps) {
  return (
    <GroupPrimitive
      className={cn(groupVariants({ orientation }), className)}
      orientation={orientation}
      {...props}
    />
  );
}

export type GroupTextPrimitiveProps = useRender.ComponentProps<"div">;

function GroupTextPrimitive({ render, ...props }: GroupTextPrimitiveProps) {
  const defaultProps = {
    "data-slot": "group-text",
  } as GroupTextPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type GroupTextProps = GroupTextPrimitiveProps;

function GroupText({ className, ...props }: GroupTextProps) {
  return (
    <GroupTextPrimitive
      className={cn(groupTextVariants(), className)}
      {...props}
    />
  );
}

export type GroupSeparatorProps = SeparatorProps;

function GroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: GroupSeparatorProps) {
  return (
    <Separator
      className={cn(groupSeparatorVariants(), className)}
      orientation={orientation}
      {...props}
    />
  );
}

export {
  Group,
  // The base ships these aliases itself, so the retirement of shadcn aliases
  // does not reach them (same exception as `CardContent`).
  Group as ButtonGroup,
  GroupPrimitive,
  GroupSeparator,
  GroupSeparator as ButtonGroupSeparator,
  GroupText,
  GroupText as ButtonGroupText,
  GroupTextPrimitive,
  groupSeparatorVariants,
  groupTextVariants,
  groupVariants,
};
