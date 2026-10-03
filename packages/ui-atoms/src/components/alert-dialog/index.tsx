import type * as React from "react";
import { AlertDialog as BaseUIAlertDialog } from "@base-ui/react/alert-dialog";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/alert-dialog.tsx` @8163481, taken wholesale and split
// into styled/primitive/variants triples. The token remap is a no-op: coss and this package share
// the token names the base's colour utilities reference.

const alertDialogBackdropVariants = cva({
  base: "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
});

const alertDialogViewportVariants = cva({
  base: "fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4",
  defaultVariants: { bottomStickOnMobile: false },
  variants: {
    // In the base this string is passed down as a `className` by
    // AlertDialogPopup; the primitive/variants split makes it a named variant so no class
    // string has to live in AlertDialogPopupPrimitive.
    bottomStickOnMobile: {
      false: "",
      true: "max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12",
    },
  },
});

const alertDialogPopupVariants = cva({
  base: "relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg origin-center flex-col rounded-2xl border bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-var(--nested-dialogs))] shadow-lg/5 transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:opacity-0 data-starting-style:opacity-0 sm:scale-[calc(1-0.1*var(--nested-dialogs))] sm:data-ending-style:scale-98 sm:data-starting-style:scale-98 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  defaultVariants: { bottomStickOnMobile: true },
  variants: {
    bottomStickOnMobile: {
      false: "",
      true: "max-sm:max-w-none max-sm:origin-bottom max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:data-ending-style:translate-y-4 max-sm:data-starting-style:translate-y-4 max-sm:before:hidden max-sm:before:rounded-none",
    },
  },
});

const alertDialogHeaderVariants = cva({
  base: "flex flex-col gap-2 p-6 text-center max-sm:pb-4 sm:text-left",
});

const alertDialogFooterVariants = cva({
  base: "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end sm:rounded-b-[calc(var(--radius-2xl)-1px)]",
  defaultVariants: { variant: "default" },
  variants: {
    variant: { bare: "pb-6", default: "border-t bg-muted/72 py-4" },
  },
});

const alertDialogTitleVariants = cva({
  base: "font-heading font-semibold text-xl leading-none",
});

const alertDialogDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

const AlertDialogCreateHandle = BaseUIAlertDialog.createHandle;
const AlertDialog = BaseUIAlertDialog.Root;
const AlertDialogPortal = BaseUIAlertDialog.Portal;

export type AlertDialogTriggerProps = BaseUIAlertDialog.Trigger.Props;

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return (
    <BaseUIAlertDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

export type AlertDialogCloseProps = BaseUIAlertDialog.Close.Props;

function AlertDialogClose(props: AlertDialogCloseProps) {
  return <BaseUIAlertDialog.Close data-slot="alert-dialog-close" {...props} />;
}

export type AlertDialogBackdropPrimitiveProps =
  BaseUIAlertDialog.Backdrop.Props;

function AlertDialogBackdropPrimitive(
  props: AlertDialogBackdropPrimitiveProps,
) {
  return (
    <BaseUIAlertDialog.Backdrop data-slot="alert-dialog-backdrop" {...props} />
  );
}

export type AlertDialogBackdropProps = AlertDialogBackdropPrimitiveProps;

function AlertDialogBackdrop({
  className,
  ...props
}: AlertDialogBackdropProps) {
  return (
    <AlertDialogBackdropPrimitive
      className={cn(alertDialogBackdropVariants(), className)}
      {...props}
    />
  );
}

export type AlertDialogViewportPrimitiveProps =
  BaseUIAlertDialog.Viewport.Props;

function AlertDialogViewportPrimitive(
  props: AlertDialogViewportPrimitiveProps,
) {
  return (
    <BaseUIAlertDialog.Viewport data-slot="alert-dialog-viewport" {...props} />
  );
}

export interface AlertDialogViewportProps
  extends AlertDialogViewportPrimitiveProps {
  bottomStickOnMobile?: boolean;
}

function AlertDialogViewport({
  bottomStickOnMobile = false,
  className,
  ...props
}: AlertDialogViewportProps) {
  return (
    <AlertDialogViewportPrimitive
      className={cn(
        alertDialogViewportVariants({ bottomStickOnMobile }),
        className,
      )}
      {...props}
    />
  );
}

export interface AlertDialogPopupPrimitiveProps
  extends BaseUIAlertDialog.Popup.Props {
  /** Turns the popup into a bottom sheet below `sm:`. */
  bottomStickOnMobile?: boolean;
  portalProps?: BaseUIAlertDialog.Portal.Props;
}

/**
 * Portal → Backdrop → Viewport → Popup. Backdrop and Viewport are composed here
 * as their styled parts, exactly as the base does — an unstyled backdrop is not
 * a modal — while the Popup element itself is left bare for the styled wrapper.
 */
function AlertDialogPopupPrimitive({
  bottomStickOnMobile = true,
  portalProps,
  ...props
}: AlertDialogPopupPrimitiveProps) {
  return (
    <AlertDialogPortal {...portalProps}>
      <AlertDialogBackdrop />
      <AlertDialogViewport bottomStickOnMobile={bottomStickOnMobile}>
        <BaseUIAlertDialog.Popup data-slot="alert-dialog-popup" {...props} />
      </AlertDialogViewport>
    </AlertDialogPortal>
  );
}

export type AlertDialogPopupProps = AlertDialogPopupPrimitiveProps;

function AlertDialogPopup({
  bottomStickOnMobile = true,
  className,
  ...props
}: AlertDialogPopupProps) {
  return (
    <AlertDialogPopupPrimitive
      bottomStickOnMobile={bottomStickOnMobile}
      className={cn(
        alertDialogPopupVariants({ bottomStickOnMobile }),
        className,
      )}
      {...props}
    />
  );
}

export type AlertDialogHeaderPrimitiveProps = React.ComponentProps<"div">;

function AlertDialogHeaderPrimitive(props: AlertDialogHeaderPrimitiveProps) {
  return <div data-slot="alert-dialog-header" {...props} />;
}

export type AlertDialogHeaderProps = AlertDialogHeaderPrimitiveProps;

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <AlertDialogHeaderPrimitive
      className={cn(alertDialogHeaderVariants(), className)}
      {...props}
    />
  );
}

export type AlertDialogFooterPrimitiveProps = React.ComponentProps<"div">;

function AlertDialogFooterPrimitive(props: AlertDialogFooterPrimitiveProps) {
  return <div data-slot="alert-dialog-footer" {...props} />;
}

export interface AlertDialogFooterProps
  extends AlertDialogFooterPrimitiveProps {
  variant?: "bare" | "default";
}

function AlertDialogFooter({
  className,
  variant = "default",
  ...props
}: AlertDialogFooterProps) {
  return (
    <AlertDialogFooterPrimitive
      className={cn(alertDialogFooterVariants({ variant }), className)}
      {...props}
    />
  );
}

export type AlertDialogTitlePrimitiveProps = BaseUIAlertDialog.Title.Props;

function AlertDialogTitlePrimitive(props: AlertDialogTitlePrimitiveProps) {
  return <BaseUIAlertDialog.Title data-slot="alert-dialog-title" {...props} />;
}

export type AlertDialogTitleProps = AlertDialogTitlePrimitiveProps;

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogTitlePrimitive
      className={cn(alertDialogTitleVariants(), className)}
      {...props}
    />
  );
}

export type AlertDialogDescriptionPrimitiveProps =
  BaseUIAlertDialog.Description.Props;

function AlertDialogDescriptionPrimitive(
  props: AlertDialogDescriptionPrimitiveProps,
) {
  return (
    <BaseUIAlertDialog.Description
      data-slot="alert-dialog-description"
      {...props}
    />
  );
}

export type AlertDialogDescriptionProps = AlertDialogDescriptionPrimitiveProps;

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <AlertDialogDescriptionPrimitive
      className={cn(alertDialogDescriptionVariants(), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogBackdrop,
  // The base ships these aliases itself, so the retirement of shadcn aliases
  // does not reach them (same exception as `CardContent`).
  AlertDialogBackdrop as AlertDialogOverlay,
  AlertDialogBackdropPrimitive,
  AlertDialogClose,
  AlertDialogCreateHandle,
  AlertDialogDescription,
  AlertDialogDescriptionPrimitive,
  AlertDialogFooter,
  AlertDialogFooterPrimitive,
  AlertDialogHeader,
  AlertDialogHeaderPrimitive,
  AlertDialogPopup,
  AlertDialogPopup as AlertDialogContent,
  AlertDialogPopupPrimitive,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTitlePrimitive,
  AlertDialogTrigger,
  AlertDialogViewport,
  AlertDialogViewportPrimitive,
  alertDialogBackdropVariants,
  alertDialogDescriptionVariants,
  alertDialogFooterVariants,
  alertDialogHeaderVariants,
  alertDialogPopupVariants,
  alertDialogTitleVariants,
  alertDialogViewportVariants,
};
