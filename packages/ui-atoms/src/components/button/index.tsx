"use client";

import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";
import { Spinner } from "../spinner/index.js";

const buttonVariants = cva({
  base: "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-sm outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-loading:select-none data-loading:text-transparent [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  variants: {
    size: {
      default: "h-8 px-[calc(--spacing(3)-1px)]",
      icon: "size-8",
      "icon-lg": "size-9",
      "icon-sm": "size-7",
      "icon-xl": "size-10 [&_svg:not([class*='size-'])]:size-4.5",
      "icon-xs":
        "size-6 rounded-md before:rounded-[calc(var(--radius-md)-1px)] not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-3.5",
      lg: "h-9 px-[calc(--spacing(3.5)-1px)]",
      sm: "h-7 gap-1.5 px-[calc(--spacing(2.5)-1px)]",
      xl: "h-10 px-[calc(--spacing(4)-1px)] text-base [&_svg:not([class*='size-'])]:size-4.5",
      xs: "h-6 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-xs before:rounded-[calc(var(--radius-md)-1px)] [&_svg:not([class*='size-'])]:size-3.5",
    },
    variant: {
      default:
        "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-primary bg-primary text-primary-foreground shadow-primary/24 shadow-xs hover:bg-primary/90 data-pressed:bg-primary/90 *:data-[slot=button-loading-indicator]:text-primary-foreground [:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
      destructive:
        "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-destructive bg-destructive text-white shadow-destructive/24 shadow-xs hover:bg-destructive/90 data-pressed:bg-destructive/90 *:data-[slot=button-loading-indicator]:text-white [:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
      "destructive-outline":
        "border-input bg-popover not-dark:bg-clip-padding text-destructive-foreground shadow-xs/5 not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] hover:border-destructive/32 hover:bg-destructive/4 data-pressed:border-destructive/32 data-pressed:bg-destructive/4 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [:disabled,:active,[data-pressed]]:shadow-none",
      ghost:
        "border-transparent text-foreground hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
      link: "border-transparent text-foreground underline-offset-4 hover:underline data-pressed:underline *:data-[slot=button-loading-indicator]:text-foreground",
      outline:
        "border-input bg-popover not-dark:bg-clip-padding text-foreground shadow-xs/5 not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] hover:bg-accent/50 data-pressed:bg-accent/50 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:data-pressed:bg-input/64 dark:hover:bg-input/64 dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [:disabled,:active,[data-pressed]]:shadow-none",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90 *:data-[slot=button-loading-indicator]:text-secondary-foreground [:active,[data-pressed]]:bg-secondary/80",
    },
  },
  defaultVariants: { size: "default", variant: "default" },
});

export interface ButtonPrimitiveProps
  extends useRender.ComponentProps<"button"> {
  /** BTN-2, from the base: renders the loading indicator, sets `data-loading`
   *  and `aria-disabled`, and disables the control. */
  loading?: boolean;
}

/**
 * Behaviour only: `data-slot`, the implicit `type`, the loading apparatus.
 * The indicator's `pointer-events-none absolute` is containment, not theme
 * styling, so it stays here — it is what makes the overlay work at all.
 */
function ButtonPrimitive({
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonPrimitiveProps) {
  const defaultProps = {
    children: (
      <>
        {children}
        {loading && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    "aria-disabled": loading || undefined,
    "data-loading": loading ? "" : undefined,
    "data-slot": "button",
    disabled: Boolean(loading || disabledProp),
    type: render
      ? undefined
      : ("button" as React.ButtonHTMLAttributes<HTMLButtonElement>["type"]),
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

export interface ButtonProps extends ButtonPrimitiveProps {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Button, ButtonPrimitive, buttonVariants };
