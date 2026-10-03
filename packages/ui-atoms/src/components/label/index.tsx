"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { cn } from "../../utils.js";

/**
 * LBL-1: the coss base's `Label` *is* v2's `GenericLabel`, plus `render` and
 * `font-medium`, so the divergence dissolves into the directory rename.
 * `text-base/4.5 … sm:text-sm/4` is a type scale on a label, not a control's
 * geometry, so the size-ramp hold-back does not reach it — it is copied as the
 * base has it (same reasoning as fieldset's legend).
 */
const labelVariants = cva({
  base: "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground sm:text-sm/4",
});

export type LabelPrimitiveProps = useRender.ComponentProps<"label">;

function LabelPrimitive({ render, ...props }: LabelPrimitiveProps) {
  const defaultProps = {
    "data-slot": "label",
  } as LabelPrimitiveProps;

  return useRender({
    defaultTagName: "label",
    props: mergeProps<"label">(defaultProps, props),
    render,
  });
}

export type LabelProps = LabelPrimitiveProps;

function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive className={cn(labelVariants(), className)} {...props} />
  );
}

export { Label, LabelPrimitive, labelVariants };
