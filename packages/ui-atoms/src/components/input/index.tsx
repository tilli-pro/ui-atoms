import type * as React from "react";
import { Input as BaseUIInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";

/**
 * The inner `<input data-slot="input">` class set. The naming is inverted
 * relative to the slot names on purpose: `inputVariants` is the input element,
 * `inputControlVariants` is the wrapper. Class strings are the coss base's with
 * the responsive size ramp collapsed to its `sm:` member (`h-8.5 … sm:h-7.5` →
 * `h-7.5`, and the same for `leading-*` and the wrapper's `text-base … sm:text-sm`).
 */
const inputVariants = cva({
  base: "h-7.5 w-full min-w-0 rounded-[inherit] px-[calc(--spacing(3)-1px)] text-foreground leading-7.5 outline-none [transition:background-color_5000000s_ease-in-out_0s] placeholder:text-muted-foreground/72 autofill:[-webkit-text-fill-color:var(--foreground)]",
  variants: {
    size: {
      default: "",
      lg: "h-8.5 leading-8.5",
      sm: "h-6.5 px-[calc(--spacing(2.5)-1px)] leading-6.5",
    },
  },
  defaultVariants: { size: "default" },
});

/** The wrapper `<span data-slot="input-control">` class set. */
const inputControlVariants = cva({
  base: "relative inline-flex w-full rounded-lg border border-input bg-background not-dark:bg-clip-padding text-sm shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-autofill:bg-foreground/4 has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-focus-visible:ring-[3px] dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

export type InputPrimitiveProps = Omit<
  BaseUIInput.Props & React.RefAttributes<HTMLInputElement>,
  "className" | "size"
> & {
  /**
   * INP-1: the caller's classes land on the **wrapper**, not on the input.
   * `input-group` styles the pair by slot, so the routing is
   * load-bearing. Narrowed to a string because the wrapper is a plain `<span>`
   * with no Base UI state to derive a class from.
   */
  className?: string;
  /** The base's own signature: the three keywords, or the HTML `size`. */
  size?: "sm" | "default" | "lg" | number;
  /** INP-3: render a native `<input>` instead of the Base UI one. */
  nativeInput?: boolean;
};

interface InputPrimitiveInternalProps extends InputPrimitiveProps {
  /**
   * Internal channel for the inner element's class set — deliberately **not**
   * part of `InputPrimitiveProps`. INP-1 removed `containerClassName` so that
   * `Input` has exactly one public `className`; re-exposing a second one here
   * would put it straight back.
   */
  inputClassName?: string;
}

function InputPrimitive({
  className,
  inputClassName,
  nativeInput = false,
  size = "default",
  style,
  ...props
}: InputPrimitiveInternalProps) {
  const innerProps = {
    className: inputClassName,
    "data-slot": "input",
    size: typeof size === "number" ? size : undefined,
    ...props,
  };

  return (
    <span className={className} data-size={size} data-slot="input-control">
      {nativeInput ? (
        <input
          {...innerProps}
          style={typeof style === "function" ? undefined : style}
        />
      ) : (
        <BaseUIInput {...innerProps} style={style} />
      )}
    </span>
  );
}

export type InputProps = InputPrimitiveProps & {
  /** INP-2: the escape hatch that replaced the `ghost` variant — it drops the
   *  wrapper's chrome and leaves the caller's classes alone. */
  unstyled?: boolean;
};

function Input({
  className,
  size = "default",
  unstyled = false,
  ...props
}: InputProps) {
  const sizeVariant: VariantProps<typeof inputVariants>["size"] =
    typeof size === "number" ? "default" : size;

  return (
    <InputPrimitive
      className={
        cn(!unstyled && inputControlVariants(), className) || undefined
      }
      inputClassName={cn(
        inputVariants({ size: sizeVariant }),
        // The base keeps these as inline branches on `type`, not as variants.
        props.type === "search" &&
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
        props.type === "file" &&
          "text-muted-foreground file:me-3 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
      )}
      size={size}
      {...props}
    />
  );
}

export { Input, InputPrimitive, inputControlVariants, inputVariants };
