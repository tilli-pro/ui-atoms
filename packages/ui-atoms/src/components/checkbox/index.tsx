import type * as React from "react";
import { Checkbox as BaseUICheckbox } from "@base-ui/react/checkbox";
import { cva } from "cva";
import { cn } from "../../utils.js";

/**
 * The coss base, with the size ramp collapsed to its `sm:` member
 * (`size-4.5 … sm:size-4` → `size-4`). Disabled styling is `data-disabled:`
 * throughout — the `:disabled` / `not-disabled:` pseudo-classes stop
 * applying the moment a caller passes `render`, because Base UI guarantees
 * only the data attribute on these roots. The checked state is painted with
 * `--color-primary`, which `styles.css` defines; no theme-specific colour
 * utilities are used.
 */
const checkboxVariants = cva({
  base: "relative inline-flex size-4 shrink-0 items-center justify-center rounded-[.25rem] border border-input bg-background not-dark:bg-clip-padding shadow-xs/5 outline-none ring-ring transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[3px] not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/48 data-disabled:cursor-not-allowed data-disabled:opacity-64 dark:not-data-checked:bg-input/32 dark:aria-invalid:ring-destructive/24 dark:not-data-disabled:not-data-checked:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)] [[data-disabled],[data-checked],[aria-invalid]]:shadow-none",
});

/** Exported on its own so a downstream fork can restyle the tick without
 *  re-authoring the root. */
const checkboxIndicatorVariants = cva({
  base: "absolute -inset-px flex items-center justify-center rounded-[.25rem] text-primary-foreground data-unchecked:hidden data-checked:bg-primary data-indeterminate:text-foreground",
});

export type CheckboxPrimitiveProps = BaseUICheckbox.Root.Props;

interface CheckboxPrimitiveInternalProps extends CheckboxPrimitiveProps {
  /** Internal channel for the indicator's class set — deliberately not part of
   *  `CheckboxPrimitiveProps`, so the primitive stays classless. */
  indicatorClassName?: string;
}

function CheckboxPrimitive({
  indicatorClassName,
  ...props
}: CheckboxPrimitiveInternalProps) {
  return (
    <BaseUICheckbox.Root data-slot="checkbox" {...props}>
      <BaseUICheckbox.Indicator
        className={indicatorClassName}
        data-slot="checkbox-indicator"
        render={(
          indicatorProps: React.ComponentProps<"span">,
          state: BaseUICheckbox.Indicator.State,
        ) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.252 12h13.496" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="size-3"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
              </svg>
            )}
          </span>
        )}
      />
    </BaseUICheckbox.Root>
  );
}

export type CheckboxProps = CheckboxPrimitiveProps;

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive
      className={cn(checkboxVariants(), className)}
      indicatorClassName={checkboxIndicatorVariants()}
      {...props}
    />
  );
}

export {
  Checkbox,
  CheckboxPrimitive,
  checkboxIndicatorVariants,
  checkboxVariants,
};
