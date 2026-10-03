import type * as React from "react";
import { Field as BaseUIField } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/textarea.tsx` @8163481, taken wholesale. Textarea is not
// one of the fourteen components the size-ramp hold-back names, so its
// `text-base … sm:text-sm` and `max-sm:` pairs are copied verbatim.

const textareaControlVariants = cva({
  base: "relative inline-flex w-full rounded-lg border border-input bg-background not-dark:bg-clip-padding text-base shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-focus-visible:ring-[3px] not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] sm:text-sm dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const textareaVariants = cva({
  base: "field-sizing-content min-h-17.5 w-full rounded-[inherit] px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] text-foreground outline-none placeholder:text-muted-foreground/72 max-sm:min-h-20.5",
  defaultVariants: { size: "default" },
  variants: {
    size: {
      default: "",
      lg: "min-h-18.5 py-[calc(--spacing(2)-1px)] max-sm:min-h-21.5",
      sm: "min-h-16.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] max-sm:min-h-19.5",
    },
  },
});

export type TextareaSize = "sm" | "default" | "lg" | number;

export type TextareaPrimitiveProps =
  React.ComponentPropsWithoutRef<"textarea"> &
    React.RefAttributes<HTMLTextAreaElement> & {
      /** Structural: mirrored onto `data-size` and picks the control's density. */
      size?: TextareaSize;
    };

interface TextareaPrimitiveInternalProps extends TextareaPrimitiveProps {
  /** Internal channel for the inner control's class set — deliberately not part
   *  of `TextareaPrimitiveProps`, so the primitive stays classless. */
  inputClassName?: string;
}

function TextareaPrimitive({
  className,
  inputClassName,
  ref,
  size = "default",
  ...props
}: TextareaPrimitiveInternalProps) {
  return (
    <span className={className} data-size={size} data-slot="textarea-control">
      <BaseUIField.Control
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        id={props.id}
        name={props.name}
        ref={ref}
        render={(defaultProps: React.ComponentProps<"textarea">) => (
          <textarea
            className={inputClassName}
            data-slot="textarea"
            {...mergeProps(defaultProps, props)}
          />
        )}
        value={props.value}
      />
    </span>
  );
}

export type TextareaProps = TextareaPrimitiveProps & {
  /** Drops the control chrome so the textarea can sit inside another surface. */
  unstyled?: boolean;
};

function Textarea({
  className,
  size = "default",
  unstyled = false,
  ...props
}: TextareaProps) {
  return (
    <TextareaPrimitive
      className={
        cn(!unstyled && textareaControlVariants(), className) || undefined
      }
      inputClassName={cn(
        textareaVariants({
          size: size === "sm" || size === "lg" ? size : "default",
        }),
      )}
      size={size}
      {...props}
    />
  );
}

export {
  Textarea,
  TextareaPrimitive,
  textareaControlVariants,
  textareaVariants,
};
