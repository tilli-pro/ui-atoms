import { Fieldset as BaseUIFieldset } from "@base-ui/react/fieldset";
import { cva } from "cva";
import { cn } from "../../utils.js";

const fieldsetVariants = cva({
  // keep-ours minus FST-1. The v2 string is
  // "flex w-full min-w-0 max-w-64 flex-col gap-6"; only `max-w-64` comes out —
  // it contradicted the same line's `w-full`. `min-w-0` and `gap-6` stay: the
  // coss base ships NO classes on the root, so there is nothing to copy from it
  // here, and FST-1 is the only live id on this component.
  base: "flex w-full min-w-0 flex-col gap-6",
});

export type FieldsetPrimitiveProps = BaseUIFieldset.Root.Props;

function FieldsetPrimitive(props: FieldsetPrimitiveProps) {
  return <BaseUIFieldset.Root data-slot="fieldset" {...props} />;
}

export type FieldsetProps = FieldsetPrimitiveProps;

function Fieldset({ className, ...props }: FieldsetProps) {
  return (
    <FieldsetPrimitive
      className={cn(fieldsetVariants(), className)}
      {...props}
    />
  );
}

const fieldsetLegendVariants = cva({
  // keep-ours: v2's `font-semibold`. The base adds `text-foreground`, which is a
  // colour utility and out of scope for this port.
  base: "font-semibold",
});

export type FieldsetLegendPrimitiveProps = BaseUIFieldset.Legend.Props;

function FieldsetLegendPrimitive(props: FieldsetLegendPrimitiveProps) {
  return <BaseUIFieldset.Legend data-slot="fieldset-legend" {...props} />;
}

export type FieldsetLegendProps = FieldsetLegendPrimitiveProps;

function FieldsetLegend({ className, ...props }: FieldsetLegendProps) {
  return (
    <FieldsetLegendPrimitive
      className={cn(fieldsetLegendVariants(), className)}
      {...props}
    />
  );
}

export {
  Fieldset,
  FieldsetLegend,
  FieldsetLegendPrimitive,
  FieldsetPrimitive,
  fieldsetLegendVariants,
  fieldsetVariants,
};
