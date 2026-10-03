import { Switch as BaseUISwitch } from "@base-ui/react/switch";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/switch.tsx` @8163481, with the size ramp collapsed to
// its `sm:` member: `[--thumb-size:--spacing(5)] … sm:[--thumb-size:--spacing(4)]`
// → `[--thumb-size:--spacing(4)]`.

const switchVariants = cva({
  base: "inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:--spacing(4)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-disabled:cursor-not-allowed data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64",
});

/** Exported on its own so a downstream fork can restyle the knob alone. */
const switchThumbVariants = cva({
  base: "pointer-events-none block aspect-square h-full origin-left in-[[role=switch]:active,[data-slot=label]:active,[data-slot=field-label]:active]:not-data-disabled:scale-x-110 in-[[role=switch]:active,[data-slot=label]:active,[data-slot=field-label]:active]:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.1)] rounded-(--thumb-size) bg-background shadow-sm/5 will-change-transform [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s] data-checked:origin-[var(--thumb-size)_50%] data-checked:translate-x-[calc(var(--thumb-size)-4px)]",
});

export type SwitchPrimitiveProps = BaseUISwitch.Root.Props;

interface SwitchPrimitiveInternalProps extends SwitchPrimitiveProps {
  /** Internal channel for the thumb's class set — deliberately not part of
   *  `SwitchPrimitiveProps`, so the primitive stays classless. */
  thumbClassName?: string;
}

function SwitchPrimitive({
  thumbClassName,
  ...props
}: SwitchPrimitiveInternalProps) {
  return (
    <BaseUISwitch.Root data-slot="switch" {...props}>
      <BaseUISwitch.Thumb className={thumbClassName} data-slot="switch-thumb" />
    </BaseUISwitch.Root>
  );
}

export type SwitchProps = SwitchPrimitiveProps;

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive
      className={cn(switchVariants(), className)}
      thumbClassName={switchThumbVariants()}
      {...props}
    />
  );
}

export { Switch, SwitchPrimitive, switchThumbVariants, switchVariants };
