"use client";

import { Dialog as BaseUIDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { XIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Button } from "../button/index.js";
import { ScrollArea } from "../scroll-area/index.js";

// The `as …PrimitiveProps` assertion on each `data-slot`-only defaults object
// is needed because `data-slot` is a valid DOM attribute but not a member of
// React's prop types, and an object literal with no other key fails
// TypeScript's weak-type check.

const dialogBackdropVariants = cva({
  base: "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
});

const dialogViewportVariants = cva({
  base: "fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4",
  variants: {
    // DLG-5: in the base this string is passed down as a `className` by
    // DialogPopup; the primitive/variants split makes it a named variant so no class string
    // has to live in DialogPopupPrimitive.
    bottomStickOnMobile: {
      false: "",
      true: "max-sm:grid-rows-[1fr_auto] max-sm:p-0 max-sm:pt-12",
    },
  },
  defaultVariants: { bottomStickOnMobile: false },
});

const dialogPopupVariants = cva({
  base: "relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg origin-center flex-col rounded-2xl border bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:opacity-0 data-starting-style:opacity-0 sm:scale-[calc(1-0.1*var(--nested-dialogs))] sm:data-ending-style:scale-98 sm:data-starting-style:scale-98 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  variants: {
    bottomStickOnMobile: {
      false: "",
      true: "max-sm:max-w-none max-sm:origin-bottom max-sm:rounded-none max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:data-ending-style:translate-y-4 max-sm:data-starting-style:translate-y-4 max-sm:before:hidden max-sm:before:rounded-none",
    },
  },
  defaultVariants: { bottomStickOnMobile: true },
});

const dialogHeaderVariants = cva({
  base: "flex flex-col gap-2 p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pb-3 max-sm:pb-4",
});

const dialogFooterVariants = cva({
  base: "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end sm:rounded-b-[calc(var(--radius-2xl)-1px)]",
  variants: {
    // DLG-3: `bare` is the less framed, more padded one — not "default minus
    // padding". Both payloads are the base's, unswapped.
    variant: {
      bare: "in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pt-3 pt-4 pb-6",
      default: "border-t bg-muted/72 py-4",
    },
  },
  defaultVariants: { variant: "default" },
});

const dialogTitleVariants = cva({
  base: "font-heading font-semibold text-xl leading-none",
});

const dialogDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

const dialogPanelVariants = cva({
  base: "p-6 in-[[data-slot=dialog-popup]:has([data-slot=dialog-header])]:pt-1 in-[[data-slot=dialog-popup]:has([data-slot=dialog-footer]:not(.border-t))]:pb-1",
});

const DialogCreateHandle = BaseUIDialog.createHandle;
const Dialog = BaseUIDialog.Root;
const DialogPortal = BaseUIDialog.Portal;

function DialogTrigger(props: BaseUIDialog.Trigger.Props) {
  return <BaseUIDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: BaseUIDialog.Close.Props) {
  return <BaseUIDialog.Close data-slot="dialog-close" {...props} />;
}

export type DialogBackdropPrimitiveProps = BaseUIDialog.Backdrop.Props;

function DialogBackdropPrimitive(props: DialogBackdropPrimitiveProps) {
  return <BaseUIDialog.Backdrop data-slot="dialog-backdrop" {...props} />;
}

export type DialogBackdropProps = DialogBackdropPrimitiveProps;

function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogBackdropPrimitive
      className={cn(dialogBackdropVariants(), className)}
      {...props}
    />
  );
}

export type DialogViewportPrimitiveProps = BaseUIDialog.Viewport.Props;

function DialogViewportPrimitive(props: DialogViewportPrimitiveProps) {
  return <BaseUIDialog.Viewport data-slot="dialog-viewport" {...props} />;
}

export interface DialogViewportProps extends DialogViewportPrimitiveProps {
  bottomStickOnMobile?: boolean;
}

function DialogViewport({
  className,
  bottomStickOnMobile = false,
  ...props
}: DialogViewportProps) {
  return (
    <DialogViewportPrimitive
      className={cn(dialogViewportVariants({ bottomStickOnMobile }), className)}
      {...props}
    />
  );
}

export interface DialogPopupPrimitiveProps extends BaseUIDialog.Popup.Props {
  /** Renders the top-end close control (base default `true`). */
  showCloseButton?: boolean;
  /** DLG-5: turns the popup into a bottom sheet below `sm:`. */
  bottomStickOnMobile?: boolean;
  /** DLG-4/DLG-5: the escape hatch that replaced `closeButtonClassName`. */
  closeProps?: BaseUIDialog.Close.Props;
  portalProps?: BaseUIDialog.Portal.Props;
}

/**
 * DLG-1: Portal → Backdrop → Viewport → Popup. The Viewport's
 * `grid-rows-[1fr_auto_3fr]` replaces v2's two anonymous divs and the non-coss
 * `dialog-scroll` slot. Backdrop and Viewport are composed here as their styled
 * parts, exactly as the base does — an unstyled backdrop is not a modal — while
 * the Popup element itself is left bare for the styled wrapper below. The close
 * control's `absolute end-2 top-2` is placement, not theme styling (DLG-6: the
 * control is a `Button`, so it has no cva of its own).
 */
function DialogPopupPrimitive({
  children,
  showCloseButton = true,
  bottomStickOnMobile = true,
  closeProps,
  portalProps,
  ...props
}: DialogPopupPrimitiveProps) {
  return (
    <DialogPortal {...portalProps}>
      <DialogBackdrop />
      <DialogViewport bottomStickOnMobile={bottomStickOnMobile}>
        <BaseUIDialog.Popup data-slot="dialog-popup" {...props}>
          {children}
          {showCloseButton && (
            <BaseUIDialog.Close
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon" variant="ghost" />}
              {...closeProps}
            >
              <XIcon />
            </BaseUIDialog.Close>
          )}
        </BaseUIDialog.Popup>
      </DialogViewport>
    </DialogPortal>
  );
}

export type DialogPopupProps = DialogPopupPrimitiveProps;

function DialogPopup({
  className,
  bottomStickOnMobile = true,
  ...props
}: DialogPopupProps) {
  return (
    <DialogPopupPrimitive
      bottomStickOnMobile={bottomStickOnMobile}
      className={cn(dialogPopupVariants({ bottomStickOnMobile }), className)}
      {...props}
    />
  );
}

export type DialogHeaderPrimitiveProps = useRender.ComponentProps<"div">;

function DialogHeaderPrimitive({
  render,
  ...props
}: DialogHeaderPrimitiveProps) {
  const defaultProps = {
    "data-slot": "dialog-header",
  } as DialogHeaderPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type DialogHeaderProps = DialogHeaderPrimitiveProps;

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <DialogHeaderPrimitive
      className={cn(dialogHeaderVariants(), className)}
      {...props}
    />
  );
}

export type DialogFooterPrimitiveProps = useRender.ComponentProps<"div">;

function DialogFooterPrimitive({
  render,
  ...props
}: DialogFooterPrimitiveProps) {
  const defaultProps = {
    "data-slot": "dialog-footer",
  } as DialogFooterPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export interface DialogFooterProps extends DialogFooterPrimitiveProps {
  variant?: "bare" | "default";
}

function DialogFooter({
  className,
  variant = "default",
  ...props
}: DialogFooterProps) {
  return (
    <DialogFooterPrimitive
      className={cn(dialogFooterVariants({ variant }), className)}
      {...props}
    />
  );
}

export type DialogTitlePrimitiveProps = BaseUIDialog.Title.Props;

function DialogTitlePrimitive(props: DialogTitlePrimitiveProps) {
  return <BaseUIDialog.Title data-slot="dialog-title" {...props} />;
}

export type DialogTitleProps = DialogTitlePrimitiveProps;

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogTitlePrimitive
      className={cn(dialogTitleVariants(), className)}
      {...props}
    />
  );
}

export type DialogDescriptionPrimitiveProps = BaseUIDialog.Description.Props;

function DialogDescriptionPrimitive(props: DialogDescriptionPrimitiveProps) {
  return <BaseUIDialog.Description data-slot="dialog-description" {...props} />;
}

export type DialogDescriptionProps = DialogDescriptionPrimitiveProps;

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogDescriptionPrimitive
      className={cn(dialogDescriptionVariants(), className)}
      {...props}
    />
  );
}

export interface DialogPanelPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  scrollFade?: boolean;
}

/** DLG-2: the scrolling body of the popup, wrapped in a `ScrollArea`. */
function DialogPanelPrimitive({
  scrollFade = true,
  render,
  ...props
}: DialogPanelPrimitiveProps) {
  const defaultProps = {
    "data-slot": "dialog-panel",
  } as DialogPanelPrimitiveProps;
  const panel = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });

  return (
    <ScrollArea overscrollContain={true} scrollFade={scrollFade}>
      {panel}
    </ScrollArea>
  );
}

export type DialogPanelProps = DialogPanelPrimitiveProps;

function DialogPanel({ className, ...props }: DialogPanelProps) {
  return (
    <DialogPanelPrimitive
      className={cn(dialogPanelVariants(), className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBackdrop,
  DialogBackdropPrimitive,
  DialogClose,
  DialogCreateHandle,
  DialogDescription,
  DialogDescriptionPrimitive,
  DialogFooter,
  DialogFooterPrimitive,
  DialogHeader,
  DialogHeaderPrimitive,
  DialogPanel,
  DialogPanelPrimitive,
  DialogPopup,
  DialogPopupPrimitive,
  DialogPortal,
  DialogTitle,
  DialogTitlePrimitive,
  DialogTrigger,
  DialogViewport,
  DialogViewportPrimitive,
  dialogBackdropVariants,
  dialogDescriptionVariants,
  dialogFooterVariants,
  dialogHeaderVariants,
  dialogPanelVariants,
  dialogPopupVariants,
  dialogTitleVariants,
  dialogViewportVariants,
};
