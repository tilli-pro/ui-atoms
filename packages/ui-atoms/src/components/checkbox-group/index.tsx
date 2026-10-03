import { CheckboxGroup as BaseUICheckboxGroup } from "@base-ui/react/checkbox-group";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/checkbox-group.tsx` @8163481. The base carries no
// `data-slot`; ours adds none either, so the markup stays identical.

const checkboxGroupVariants = cva({ base: "flex flex-col items-start gap-3" });

export type CheckboxGroupPrimitiveProps = BaseUICheckboxGroup.Props;

function CheckboxGroupPrimitive(props: CheckboxGroupPrimitiveProps) {
  return <BaseUICheckboxGroup {...props} />;
}

export type CheckboxGroupProps = CheckboxGroupPrimitiveProps;

function CheckboxGroup({ className, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      className={cn(checkboxGroupVariants(), className)}
      {...props}
    />
  );
}

export { CheckboxGroup, CheckboxGroupPrimitive, checkboxGroupVariants };
