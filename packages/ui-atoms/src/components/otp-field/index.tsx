import { OTPField as BaseUIOTPField } from "@base-ui/react/otp-field";
import { cva } from "cva";
import { cn } from "../../utils.js";
import { Separator, type SeparatorProps } from "../separator/index.js";

// OTP-1, swap 1 of 4: `input-otp` → `@base-ui/react/otp-field`. coss base
// `.coss-base/otp-field.tsx` @8163481. `otp-field` is not one of the fourteen
// the size-ramp hold-back names, so its `sm:` pairs are the base's verbatim.
//
// Breaking surface for consumers migrating from the earlier component: the directory and subpath become
// `otp-field`; `InputOTP` → `OTPField` (`maxLength` → `length`), `InputOTPSlot`
// → `OTPFieldInput` (no `index`), `InputOTPSeparator` → `OTPFieldSeparator`,
// and `InputOTPGroup` is deleted.

const otpFieldVariants = cva({
  base: "flex items-center gap-2 has-disabled:opacity-64 has-disabled:**:data-[slot=otp-field-input]:shadow-none has-disabled:**:data-[slot=otp-field-input]:before:shadow-none!",
});

const otpFieldInputVariants = cva({
  base: "relative in-[[data-slot=otp-field][data-size=lg]]:size-10 size-9 min-w-0 rounded-lg border border-input bg-background not-dark:bg-clip-padding text-center in-[[data-slot=otp-field][data-size=lg]]:text-lg text-base text-foreground in-[[data-slot=otp-field][data-size=lg]]:leading-10 leading-9 shadow-xs/5 outline-none ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-focus-visible:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-visible:z-10 focus-visible:border-ring focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-ring/24 aria-invalid:border-destructive/36 aria-invalid:shadow-none aria-invalid:focus-visible:border-destructive/64 aria-invalid:focus-visible:ring-destructive/16 sm:in-[[data-slot=otp-field][data-size=lg]]:size-9 sm:size-8 sm:in-[[data-slot=otp-field][data-size=lg]]:text-base sm:text-sm sm:in-[[data-slot=otp-field][data-size=lg]]:leading-9 sm:leading-8 dark:bg-input/32 dark:aria-invalid:focus-visible:ring-destructive/24 dark:not-focus-visible:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const otpFieldSeparatorVariants = cva({
  base: "rounded-full bg-input data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-3",
});

export interface OTPFieldPrimitiveProps extends BaseUIOTPField.Root.Props {
  /** Structural: mirrored onto `data-size`, which the inputs style against. */
  size?: "default" | "lg";
}

function OTPFieldPrimitive({
  size = "default",
  ...props
}: OTPFieldPrimitiveProps) {
  return (
    <BaseUIOTPField.Root data-size={size} data-slot="otp-field" {...props} />
  );
}

export type OTPFieldProps = OTPFieldPrimitiveProps;

function OTPField({ className, ...props }: OTPFieldProps) {
  return (
    <OTPFieldPrimitive
      className={cn(otpFieldVariants(), className)}
      {...props}
    />
  );
}

export type OTPFieldInputPrimitiveProps = BaseUIOTPField.Input.Props;

function OTPFieldInputPrimitive(props: OTPFieldInputPrimitiveProps) {
  return (
    <BaseUIOTPField.Input
      data-slot="otp-field-input"
      spellCheck={false}
      {...props}
    />
  );
}

export type OTPFieldInputProps = OTPFieldInputPrimitiveProps;

function OTPFieldInput({ className, ...props }: OTPFieldInputProps) {
  return (
    <OTPFieldInputPrimitive
      className={cn(otpFieldInputVariants(), className)}
      {...props}
    />
  );
}

export type OTPFieldSeparatorProps = SeparatorProps;

function OTPFieldSeparator({ className, ...props }: OTPFieldSeparatorProps) {
  return (
    <BaseUIOTPField.Separator
      render={
        <Separator
          className={cn(otpFieldSeparatorVariants(), className)}
          orientation="horizontal"
          {...props}
        />
      }
    />
  );
}

export {
  OTPField,
  OTPFieldInput,
  OTPFieldInputPrimitive,
  OTPFieldPrimitive,
  OTPFieldSeparator,
  otpFieldInputVariants,
  otpFieldSeparatorVariants,
  otpFieldVariants,
};
