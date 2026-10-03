import { Separator as BaseUISeparator } from "@base-ui/react/separator";
import { cva } from "cva";
import { cn } from "../../utils.js";

const separatorVariants = cva({
  base: "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:not-[[class^='h-']]:not-[[class*='_h-']]:self-stretch",
});

export type SeparatorPrimitiveProps = BaseUISeparator.Props;

function SeparatorPrimitive({
  orientation = "horizontal",
  ...props
}: SeparatorPrimitiveProps) {
  return (
    <BaseUISeparator
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export type SeparatorProps = SeparatorPrimitiveProps;

function Separator({ className, ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      className={cn(separatorVariants(), className)}
      {...props}
    />
  );
}

export { Separator, SeparatorPrimitive, separatorVariants };
