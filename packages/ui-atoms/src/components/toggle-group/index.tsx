"use client";

import * as React from "react";
import { ToggleGroup as BaseUIToggleGroup } from "@base-ui/react/toggle-group";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";
import { Separator, type SeparatorProps } from "../separator/index.js";
import { Toggle, type TogglePrimitiveProps } from "../toggle/index.js";

// coss base `.coss-base/toggle-group.tsx` @8163481. The base's nested ternary on
// `variant`/`orientation` is expressed as cva compound variants; the class
// strings are verbatim.

const toggleGroupVariants = cva({
  base: "flex w-fit *:focus-visible:z-10 dark:*:[[data-slot=separator]:has(+[data-slot=toggle]:hover)]:before:bg-input/64 dark:*:[[data-slot=separator]:has(+[data-slot=toggle][data-pressed])]:before:bg-input dark:*:[[data-slot=toggle]:hover+[data-slot=separator]]:before:bg-input/64 dark:*:[[data-slot=toggle][data-pressed]+[data-slot=separator]]:before:bg-input",
  compoundVariants: [
    {
      className:
        "*:not-first:rounded-s-none *:not-last:rounded-e-none *:not-first:border-s-0 *:not-last:border-e-0 *:not-first:not-data-[slot=separator]:before:-start-[0.5px] *:not-last:not-data-[slot=separator]:before:-end-[0.5px] *:not-first:before:rounded-s-none *:not-last:before:rounded-e-none",
      orientation: "horizontal",
      variant: "outline",
    },
    {
      className:
        "flex-col *:not-first:rounded-t-none *:not-last:rounded-b-none *:not-first:border-t-0 *:not-last:border-b-0 *:not-first:not-data-[slot=separator]:before:-top-[0.5px] *:not-last:not-data-[slot=separator]:before:-bottom-[0.5px] *:not-first:before:rounded-t-none *:not-last:before:rounded-b-none *:data-[slot=toggle]:not-last:before:hidden dark:*:last:before:hidden dark:*:first:before:block",
      orientation: "vertical",
      variant: "outline",
    },
  ],
  defaultVariants: { orientation: "horizontal", variant: "default" },
  variants: {
    orientation: {
      horizontal: "*:pointer-coarse:after:min-w-auto",
      vertical: "*:pointer-coarse:after:min-h-auto",
    },
    variant: { default: "gap-0.5", outline: "" },
  },
});

const toggleGroupSeparatorVariants = cva({
  base: "pointer-events-none relative bg-input before:absolute before:inset-0 dark:before:bg-input/32",
});

type ToggleVariant = NonNullable<
  VariantProps<typeof toggleGroupVariants>["variant"]
>;
type ToggleSize = "default" | "lg" | "sm";

const ToggleGroupContext = React.createContext<{
  size?: ToggleSize;
  variant?: ToggleVariant;
}>({ size: "default", variant: "default" });

export interface ToggleGroupPrimitiveProps extends BaseUIToggleGroup.Props {
  /** Structural: mirrored onto `data-size` and shared with every item. */
  size?: ToggleSize;
  /** Structural: mirrored onto `data-variant` and shared with every item. */
  variant?: ToggleVariant;
}

function ToggleGroupPrimitive({
  children,
  orientation = "horizontal",
  size = "default",
  variant = "default",
  ...props
}: ToggleGroupPrimitiveProps) {
  return (
    <BaseUIToggleGroup
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseUIToggleGroup>
  );
}

export type ToggleGroupProps = ToggleGroupPrimitiveProps;

function ToggleGroup({
  className,
  orientation = "horizontal",
  size = "default",
  variant = "default",
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      className={cn(toggleGroupVariants({ orientation, variant }), className)}
      orientation={orientation}
      size={size}
      variant={variant}
      {...props}
    />
  );
}

export interface ToggleGroupItemProps extends TogglePrimitiveProps {
  size?: ToggleSize;
  variant?: ToggleVariant;
}

/** Reads the group's `size`/`variant` out of context, falling back to its own. */
function ToggleGroupItem({
  children,
  size,
  variant,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = context.variant || variant;
  const resolvedSize = context.size || size;

  return (
    <Toggle
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      size={resolvedSize}
      variant={resolvedVariant}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export type ToggleGroupSeparatorProps = SeparatorProps;

function ToggleGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: ToggleGroupSeparatorProps) {
  return (
    <Separator
      className={cn(toggleGroupSeparatorVariants(), className)}
      orientation={orientation}
      {...props}
    />
  );
}

export {
  ToggleGroup,
  ToggleGroupContext,
  ToggleGroupItem,
  ToggleGroupPrimitive,
  ToggleGroupSeparator,
  toggleGroupSeparatorVariants,
  toggleGroupVariants,
};
