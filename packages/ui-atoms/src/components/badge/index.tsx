"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/badge.tsx` @8163481, with the size ramp collapsed to its
// `sm:` member throughout. `[button&,a&]` is the base's form, so BDG-2's
// mis-placed-comma variant of that selector is gone with the re-port.

const badgeVariants = cva({
  base: "relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm border border-transparent font-medium outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [button&,a&]:cursor-pointer [button&,a&]:pointer-coarse:after:absolute [button&,a&]:pointer-coarse:after:size-full [button&,a&]:pointer-coarse:after:min-h-11 [button&,a&]:pointer-coarse:after:min-w-11",
  defaultVariants: { size: "default", variant: "default" },
  variants: {
    size: {
      default: "h-4.5 min-w-4.5 px-[calc(--spacing(1)-1px)] text-xs",
      lg: "h-5.5 min-w-5.5 px-[calc(--spacing(1.5)-1px)] text-sm",
      sm: "h-4 min-w-4 rounded-[.25rem] px-[calc(--spacing(1)-1px)] text-[.625rem]",
    },
    variant: {
      default:
        "bg-primary text-primary-foreground [button&,a&]:hover:bg-primary/90",
      destructive:
        "bg-destructive text-white [button&,a&]:hover:bg-destructive/90",
      error:
        "bg-destructive/8 text-destructive-foreground dark:bg-destructive/16",
      info: "bg-info/8 text-info-foreground dark:bg-info/16",
      outline:
        "border-input bg-background text-foreground dark:bg-input/32 [button&,a&]:hover:bg-accent/50 dark:[button&,a&]:hover:bg-input/48",
      secondary:
        "bg-secondary text-secondary-foreground [button&,a&]:hover:bg-secondary/90",
      success: "bg-success/8 text-success-foreground dark:bg-success/16",
      warning: "bg-warning/8 text-warning-foreground dark:bg-warning/16",
    },
  },
});

export type BadgePrimitiveProps = useRender.ComponentProps<"span">;

function BadgePrimitive({ render, ...props }: BadgePrimitiveProps) {
  // The `as …PrimitiveProps` assertion is needed because `data-slot` is a
  // valid DOM attribute but not a member of React's prop types, and an object
  // literal with no other key fails TypeScript's weak-type check.
  const defaultProps = { "data-slot": "badge" } as BadgePrimitiveProps;

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(defaultProps, props),
    render,
  });
}

export interface BadgeProps extends BadgePrimitiveProps {
  size?: VariantProps<typeof badgeVariants>["size"];
  variant?: VariantProps<typeof badgeVariants>["variant"];
}

function Badge({ className, size, variant, ...props }: BadgeProps) {
  return (
    <BadgePrimitive
      className={cn(badgeVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Badge, BadgePrimitive, badgeVariants };
