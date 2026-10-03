import type * as React from "react";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/alert.tsx` @8163481. Against our fork the base fixes the
// grid-template ordering and uses `h-lh` in place of `h-[1lh]`; no live id and
// no tilli lead touches this component, so the base wins throughout.

const alertVariants = cva({
  base: "relative grid w-full items-start gap-x-2 gap-y-0.5 rounded-xl border px-3.5 py-3 text-card-foreground text-sm has-[>svg]:has-data-[slot=alert-action]:grid-cols-[calc(var(--spacing)*4)_1fr_auto] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-data-[slot=alert-action]:grid-cols-[1fr_auto] has-[>svg]:gap-x-2 [&>svg]:h-lh [&>svg]:w-4",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "bg-transparent dark:bg-input/32 [&>svg]:text-muted-foreground",
      error: "border-destructive/32 bg-destructive/4 [&>svg]:text-destructive",
      info: "border-info/32 bg-info/4 [&>svg]:text-info",
      success: "border-success/32 bg-success/4 [&>svg]:text-success",
      warning: "border-warning/32 bg-warning/4 [&>svg]:text-warning",
    },
  },
});

const alertTitleVariants = cva({ base: "font-medium [svg~&]:col-start-2" });

const alertDescriptionVariants = cva({
  base: "flex flex-col gap-2.5 text-muted-foreground [svg~&]:col-start-2",
});

const alertActionVariants = cva({
  base: "flex gap-1 max-sm:col-start-2 max-sm:mt-2 sm:row-start-1 sm:row-end-3 sm:self-center sm:[[data-slot=alert-description]~&]:col-start-2 sm:[[data-slot=alert-title]~&]:col-start-2 sm:[svg~&]:col-start-2 sm:[svg~[data-slot=alert-description]~&]:col-start-3 sm:[svg~[data-slot=alert-title]~&]:col-start-3",
});

export type AlertPrimitiveProps = React.ComponentProps<"div">;

function AlertPrimitive(props: AlertPrimitiveProps) {
  return <div data-slot="alert" role="alert" {...props} />;
}

export interface AlertProps
  extends AlertPrimitiveProps,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <AlertPrimitive
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export type AlertTitlePrimitiveProps = React.ComponentProps<"div">;

function AlertTitlePrimitive(props: AlertTitlePrimitiveProps) {
  return <div data-slot="alert-title" {...props} />;
}

export type AlertTitleProps = AlertTitlePrimitiveProps;

function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <AlertTitlePrimitive
      className={cn(alertTitleVariants(), className)}
      {...props}
    />
  );
}

export type AlertDescriptionPrimitiveProps = React.ComponentProps<"div">;

function AlertDescriptionPrimitive(props: AlertDescriptionPrimitiveProps) {
  return <div data-slot="alert-description" {...props} />;
}

export type AlertDescriptionProps = AlertDescriptionPrimitiveProps;

function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <AlertDescriptionPrimitive
      className={cn(alertDescriptionVariants(), className)}
      {...props}
    />
  );
}

export type AlertActionPrimitiveProps = React.ComponentProps<"div">;

function AlertActionPrimitive(props: AlertActionPrimitiveProps) {
  return <div data-slot="alert-action" {...props} />;
}

export type AlertActionProps = AlertActionPrimitiveProps;

function AlertAction({ className, ...props }: AlertActionProps) {
  return (
    <AlertActionPrimitive
      className={cn(alertActionVariants(), className)}
      {...props}
    />
  );
}

export {
  Alert,
  AlertAction,
  AlertActionPrimitive,
  AlertDescription,
  AlertDescriptionPrimitive,
  AlertPrimitive,
  AlertTitle,
  AlertTitlePrimitive,
  alertActionVariants,
  alertDescriptionVariants,
  alertTitleVariants,
  alertVariants,
};
