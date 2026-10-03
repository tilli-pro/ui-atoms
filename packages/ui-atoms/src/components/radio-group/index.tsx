import { Radio as BaseUIRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseUIRadioGroup } from "@base-ui/react/radio-group";
import { cva } from "cva";
import { cn } from "../../utils.js";

// The coss base, taken wholesale, with the size ramp collapsed to its `sm:`
// member (`size-4.5 … sm:size-4` → `size-4`, `before:size-2 … sm:before:size-1.5`
// → `before:size-1.5`). Disabled styling is `data-disabled:` throughout, never
// the `:disabled` / `not-disabled:` pseudo-classes, which stop applying as soon
// as a caller passes `render`.

const radioGroupVariants = cva({ base: "flex flex-col gap-3" });

export type RadioGroupPrimitiveProps = BaseUIRadioGroup.Props;

function RadioGroupPrimitive(props: RadioGroupPrimitiveProps) {
  return <BaseUIRadioGroup data-slot="radio-group" {...props} />;
}

export type RadioGroupProps = RadioGroupPrimitiveProps;

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      className={cn(radioGroupVariants(), className)}
      {...props}
    />
  );
}

const radioVariants = cva({
  base: "relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background not-dark:bg-clip-padding shadow-xs/5 outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-full not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 data-disabled:cursor-not-allowed data-disabled:opacity-64 dark:not-data-checked:bg-input/32 dark:aria-invalid:ring-destructive/24 dark:not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)] [[data-disabled],[data-checked],[aria-invalid]]:shadow-none",
});

/** Exported on its own so a downstream fork can restyle the dot alone. */
const radioIndicatorVariants = cva({
  base: "absolute -inset-px flex size-4 items-center justify-center rounded-full before:size-1.5 before:rounded-full before:bg-primary-foreground data-unchecked:hidden data-checked:bg-primary",
});

export type RadioPrimitiveProps = BaseUIRadio.Root.Props;

interface RadioPrimitiveInternalProps extends RadioPrimitiveProps {
  /** Internal channel for the indicator's class set — deliberately not part of
   *  `RadioPrimitiveProps`, so the primitive stays classless. */
  indicatorClassName?: string;
}

function RadioPrimitive({
  indicatorClassName,
  ...props
}: RadioPrimitiveInternalProps) {
  return (
    <BaseUIRadio.Root data-slot="radio" {...props}>
      <BaseUIRadio.Indicator
        className={indicatorClassName}
        data-slot="radio-indicator"
      />
    </BaseUIRadio.Root>
  );
}

export type RadioProps = RadioPrimitiveProps;

function Radio({ className, ...props }: RadioProps) {
  return (
    <RadioPrimitive
      className={cn(radioVariants(), className)}
      indicatorClassName={radioIndicatorVariants()}
      {...props}
    />
  );
}

export {
  Radio,
  // The base ships this alias itself, so the retirement of shadcn aliases
  // does not reach it (same exception as `CardContent`).
  Radio as RadioGroupItem,
  RadioGroup,
  RadioGroupPrimitive,
  RadioPrimitive,
  radioGroupVariants,
  radioIndicatorVariants,
  radioVariants,
};
