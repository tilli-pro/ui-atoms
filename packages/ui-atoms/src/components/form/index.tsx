import { Form as BaseUIForm } from "@base-ui/react/form";
import { cva } from "cva";
import { cn } from "../../utils.js";

/**
 * FRM-1: reset to coss. v2's `flex w-full flex-col gap-4`
 * is gone — <Form> contributes no layout. The export survives so
 * downstream forks compose over something, and so a future opinion has one
 * place to live.
 */
const formVariants = cva({ base: "" });

export type FormPrimitiveProps = BaseUIForm.Props;

function FormPrimitive(props: FormPrimitiveProps) {
  return <BaseUIForm data-slot="form" {...props} />;
}

export type FormProps = FormPrimitiveProps;

function Form({ className, ...props }: FormProps) {
  return <FormPrimitive className={cn(formVariants(), className)} {...props} />;
}

export { Form, FormPrimitive, formVariants };
