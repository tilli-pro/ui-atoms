import { Toggle as BaseUIToggle } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/toggle.tsx` @8163481, with the size ramp collapsed to its
// `sm:` member throughout. Re-ported before `toggle-group`, whose root selectors
// key off this file's `data-slot=toggle`.

const toggleVariants = cva({
  base: "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-foreground text-sm outline-none transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-pressed:bg-input/64 data-pressed:text-accent-foreground [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  defaultVariants: { size: "default", variant: "default" },
  variants: {
    size: {
      default: "h-8 min-w-8 px-[calc(--spacing(2)-1px)]",
      lg: "h-9 min-w-9 px-[calc(--spacing(2.5)-1px)]",
      sm: "h-7 min-w-7 px-[calc(--spacing(1.5)-1px)]",
    },
    variant: {
      default: "border-transparent",
      outline:
        "border-input bg-background not-dark:bg-clip-padding shadow-xs/5 not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] dark:bg-input/32 dark:data-pressed:bg-input dark:hover:bg-input/64 dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] dark:not-disabled:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/2%)] [:disabled,:active,[data-pressed]]:shadow-none",
    },
  },
});

export type TogglePrimitiveProps = BaseUIToggle.Props;

function TogglePrimitive(props: TogglePrimitiveProps) {
  return <BaseUIToggle data-slot="toggle" {...props} />;
}

export interface ToggleProps
  extends TogglePrimitiveProps,
    VariantProps<typeof toggleVariants> {}

function Toggle({ className, size, variant, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      className={cn(toggleVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Toggle, TogglePrimitive, toggleVariants };
