import { Field as BaseUIField } from "@base-ui/react/field";
import { cva } from "cva";
import { cn } from "../../utils.js";

// The whole family comes from one coss base file, split into styled/primitive/variants triples. The
// four tilli divergences here are all resets, i.e. deletions: `FieldError` no
// longer rewrites string children through `formatArktypeValidationMessage`
// (FLD-2 — the helper stays exported from `../../formatters.js` for callers
// who want it) and no longer carries a copy-pasted `variant`/`size` (FLD-3);
// `FieldRoot`'s `centered` boolean is gone in favour of
// `className="items-center"` (FLD-5); and the duplicated `space-y-2` goes with
// the base's `items-start` layout (FLD-6).

const fieldVariants = cva({ base: "flex flex-col items-start gap-2" });

export type FieldPrimitiveProps = BaseUIField.Root.Props;

function FieldPrimitive(props: FieldPrimitiveProps) {
  return <BaseUIField.Root data-slot="field" {...props} />;
}

export type FieldProps = FieldPrimitiveProps;

function Field({ className, ...props }: FieldProps) {
  return (
    <FieldPrimitive className={cn(fieldVariants(), className)} {...props} />
  );
}

/** LBL-2: the dead `peer-disabled:` hook is the base's `data-disabled:`. */
const fieldLabelVariants = cva({
  base: "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground data-disabled:opacity-64 sm:text-sm/4",
});

export type FieldLabelPrimitiveProps = BaseUIField.Label.Props;

function FieldLabelPrimitive(props: FieldLabelPrimitiveProps) {
  return <BaseUIField.Label data-slot="field-label" {...props} />;
}

export type FieldLabelProps = FieldLabelPrimitiveProps;

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <FieldLabelPrimitive
      className={cn(fieldLabelVariants(), className)}
      {...props}
    />
  );
}

/** FLD-4: the base's own part — v2 had no equivalent. */
const fieldItemVariants = cva({ base: "flex" });

export type FieldItemPrimitiveProps = BaseUIField.Item.Props;

function FieldItemPrimitive(props: FieldItemPrimitiveProps) {
  return <BaseUIField.Item data-slot="field-item" {...props} />;
}

export type FieldItemProps = FieldItemPrimitiveProps;

function FieldItem({ className, ...props }: FieldItemProps) {
  return (
    <FieldItemPrimitive
      className={cn(fieldItemVariants(), className)}
      {...props}
    />
  );
}

const fieldDescriptionVariants = cva({ base: "text-muted-foreground text-xs" });

export type FieldDescriptionPrimitiveProps = BaseUIField.Description.Props;

function FieldDescriptionPrimitive(props: FieldDescriptionPrimitiveProps) {
  return <BaseUIField.Description data-slot="field-description" {...props} />;
}

export type FieldDescriptionProps = FieldDescriptionPrimitiveProps;

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <FieldDescriptionPrimitive
      className={cn(fieldDescriptionVariants(), className)}
      {...props}
    />
  );
}

const fieldErrorVariants = cva({ base: "text-destructive-foreground text-xs" });

export type FieldErrorPrimitiveProps = BaseUIField.Error.Props;

/**
 * FLD-1: a real Base UI field error element, not a `<div>`. It renders only
 * while the field
 * is invalid (or `match` says so) and consumes `match` instead of leaking it
 * to the DOM, so call sites that pass `match` start behaving as
 * their authors intended.
 */
function FieldErrorPrimitive(props: FieldErrorPrimitiveProps) {
  return <BaseUIField.Error data-slot="field-error" {...props} />;
}

export type FieldErrorProps = FieldErrorPrimitiveProps;

function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <FieldErrorPrimitive
      className={cn(fieldErrorVariants(), className)}
      {...props}
    />
  );
}

/** Behaviour-only parts: no classes to split off, so they are re-exported. */
const FieldControl: typeof BaseUIField.Control = BaseUIField.Control;
const FieldValidity: typeof BaseUIField.Validity = BaseUIField.Validity;

export {
  Field,
  FieldControl,
  FieldDescription,
  FieldDescriptionPrimitive,
  FieldError,
  FieldErrorPrimitive,
  FieldItem,
  FieldItemPrimitive,
  FieldLabel,
  FieldLabelPrimitive,
  FieldPrimitive,
  FieldValidity,
  fieldDescriptionVariants,
  fieldErrorVariants,
  fieldItemVariants,
  fieldLabelVariants,
  fieldVariants,
};
