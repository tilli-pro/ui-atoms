import type * as React from "react";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
} from "../number-field/index.js";

/**
 * `./number-field` preset for money. The value is a `number` everywhere it
 * appears (`value`, `defaultValue`, `onValueChange`, what `name` submits);
 * only the display is a formatted string. Every slot is number-field's. For
 * steppers, compose `NumberFieldIncrement` and `NumberFieldDecrement` from
 * `./number-field` instead.
 */
export type CurrencyInputProps = Omit<
  React.ComponentProps<typeof NumberField>,
  "children" | "format"
> & {
  /** ISO 4217 code, passed to `Intl.NumberFormat` as `currency`. */
  currency?: string;
  /** Any other `Intl.NumberFormat` option. */
  format?: Omit<Intl.NumberFormatOptions, "currency" | "style">;
  /** Props for the inner `number-field-input`, the element the user types in. */
  inputProps?: React.ComponentProps<typeof NumberFieldInput>;
};

function CurrencyInput({
  currency = "USD",
  format,
  inputProps,
  // The primitive's default of 1 fails native validation for any amount with
  // cents once `min` gives the browser a step base.
  step = "any",
  ...props
}: CurrencyInputProps) {
  return (
    <NumberField
      {...props}
      format={{ ...format, currency, style: "currency" }}
      step={step}
    >
      <NumberFieldGroup>
        <NumberFieldInput {...inputProps} />
      </NumberFieldGroup>
    </NumberField>
  );
}

export { CurrencyInput };
