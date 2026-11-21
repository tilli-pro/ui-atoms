"use client";

import { Dialog as BaseUISheet } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { XIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Button } from "../button/index.js";
import { ScrollArea } from "../scroll-area/index.js";

// coss base `.coss-base/sheet.tsx` @b2336c4, taken wholesale and split into the
// styled/primitive/variants triple. `sheet` is not one of the fourteen components
// the size-ramp hold-back names, so its `sm:` classes are the base's verbatim.
// Against the v2 sheet this replaces: the popup sits in a Viewport, `SheetPanel`
// is the padded, scrolling body (v2 had none, so body content ran edge to edge),
// `variant="inset"` floats the sheet as a rounded card from `sm:` up, the footer
// has a `bare` variant, and the close control is a ghost `Button`.
//
// The `as …PrimitiveProps` assertion on each `data-slot`-only defaults object is
// needed because `data-slot` is a valid DOM attribute but not a member of
// React's prop types, and an object literal with no other key fails
// TypeScript's weak-type check.

export type SheetSide = "bottom" | "left" | "right" | "top";
export type SheetVariant = "default" | "inset";

const sheetBackdropVariants = cva({
  base: "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute",
});

const sheetViewportVariants = cva({
  base: "fixed inset-0 z-50 grid",
  defaultVariants: { variant: "default" },
  variants: {
    side: {
      bottom: "grid grid-rows-[1fr_auto] pt-12",
      left: "flex justify-start",
      right: "flex justify-end",
      top: "grid grid-rows-[auto_1fr] pb-12",
    },
    variant: { default: "", inset: "sm:p-4" },
  },
});

const sheetPopupVariants = cva({
  base: "relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 transition-[opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:opacity-0 data-starting-style:opacity-0 max-sm:before:hidden dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  defaultVariants: { side: "right", variant: "default" },
  variants: {
    side: {
      bottom:
        "row-start-2 border-t data-ending-style:translate-y-8 data-starting-style:translate-y-8",
      left: "w-[calc(100%-(--spacing(12)))] max-w-md border-e data-ending-style:-translate-x-8 data-starting-style:-translate-x-8",
      right:
        "col-start-2 w-[calc(100%-(--spacing(12)))] max-w-md border-s data-ending-style:translate-x-8 data-starting-style:translate-x-8",
      top: "border-b data-ending-style:-translate-y-8 data-starting-style:-translate-y-8",
    },
    variant: {
      default: "",
      inset:
        "before:hidden sm:rounded-2xl sm:border sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=sheet-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
    },
  },
});

const sheetHeaderVariants = cva({
  base: "flex flex-col gap-2 p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pb-3 max-sm:pb-4",
});

const sheetFooterVariants = cva({
  base: "flex flex-col-reverse gap-2 px-6 sm:flex-row sm:justify-end",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      bare: "in-[[data-slot=sheet-popup]:has([data-slot=sheet-panel])]:pt-3 pt-4 pb-6",
      default: "border-t bg-muted/72 py-4",
    },
  },
});

const sheetTitleVariants = cva({
  base: "font-bold font-heading text-xl leading-none",
});

const sheetDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

const sheetPanelVariants = cva({
  base: "p-6 in-[[data-slot=sheet-popup]:has([data-slot=sheet-header])]:pt-1 in-[[data-slot=sheet-popup]:has([data-slot=sheet-footer]:not(.border-t))]:pb-1",
});

const Sheet = BaseUISheet.Root;
const SheetPortal = BaseUISheet.Portal;

function SheetTrigger(props: BaseUISheet.Trigger.Props) {
  return <BaseUISheet.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: BaseUISheet.Close.Props) {
  return <BaseUISheet.Close data-slot="sheet-close" {...props} />;
}

export type SheetBackdropPrimitiveProps = BaseUISheet.Backdrop.Props;

function SheetBackdropPrimitive(props: SheetBackdropPrimitiveProps) {
  return <BaseUISheet.Backdrop data-slot="sheet-backdrop" {...props} />;
}

export type SheetBackdropProps = SheetBackdropPrimitiveProps;

function SheetBackdrop({ className, ...props }: SheetBackdropProps) {
  return (
    <SheetBackdropPrimitive
      className={cn(sheetBackdropVariants(), className)}
      {...props}
    />
  );
}

export type SheetViewportPrimitiveProps = BaseUISheet.Viewport.Props;

function SheetViewportPrimitive(props: SheetViewportPrimitiveProps) {
  return <BaseUISheet.Viewport data-slot="sheet-viewport" {...props} />;
}

export interface SheetViewportProps extends SheetViewportPrimitiveProps {
  side?: SheetSide;
  variant?: SheetVariant;
}

function SheetViewport({
  className,
  side,
  variant = "default",
  ...props
}: SheetViewportProps) {
  return (
    <SheetViewportPrimitive
      className={cn(sheetViewportVariants({ side, variant }), className)}
      {...props}
    />
  );
}

export interface SheetPopupPrimitiveProps extends BaseUISheet.Popup.Props {
  /** Renders the top-end close control (base default `true`). */
  showCloseButton?: boolean;
  side?: SheetSide;
  variant?: SheetVariant;
  closeProps?: BaseUISheet.Close.Props;
  portalProps?: BaseUISheet.Portal.Props;
}

/**
 * Portal → Backdrop → Viewport → Popup. Backdrop and Viewport are composed here
 * as their styled parts, exactly as the base does, while the Popup element
 * itself is left bare for the styled wrapper below. The close control's
 * `absolute end-2 top-2` is placement, not theme styling.
 */
function SheetPopupPrimitive({
  children,
  showCloseButton = true,
  side = "right",
  variant = "default",
  closeProps,
  portalProps,
  ...props
}: SheetPopupPrimitiveProps) {
  return (
    <SheetPortal {...portalProps}>
      <SheetBackdrop />
      <SheetViewport side={side} variant={variant}>
        <BaseUISheet.Popup data-slot="sheet-popup" {...props}>
          {children}
          {showCloseButton && (
            <BaseUISheet.Close
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon" variant="ghost" />}
              {...closeProps}
            >
              <XIcon />
            </BaseUISheet.Close>
          )}
        </BaseUISheet.Popup>
      </SheetViewport>
    </SheetPortal>
  );
}

export type SheetPopupProps = SheetPopupPrimitiveProps;

function SheetPopup({
  className,
  side = "right",
  variant = "default",
  ...props
}: SheetPopupProps) {
  return (
    <SheetPopupPrimitive
      className={cn(sheetPopupVariants({ side, variant }), className)}
      side={side}
      variant={variant}
      {...props}
    />
  );
}

export type SheetHeaderPrimitiveProps = useRender.ComponentProps<"div">;

function SheetHeaderPrimitive({ render, ...props }: SheetHeaderPrimitiveProps) {
  const defaultProps = {
    "data-slot": "sheet-header",
  } as SheetHeaderPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type SheetHeaderProps = SheetHeaderPrimitiveProps;

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return (
    <SheetHeaderPrimitive
      className={cn(sheetHeaderVariants(), className)}
      {...props}
    />
  );
}

export type SheetFooterPrimitiveProps = useRender.ComponentProps<"div">;

function SheetFooterPrimitive({ render, ...props }: SheetFooterPrimitiveProps) {
  const defaultProps = {
    "data-slot": "sheet-footer",
  } as SheetFooterPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export interface SheetFooterProps extends SheetFooterPrimitiveProps {
  variant?: "bare" | "default";
}

function SheetFooter({
  className,
  variant = "default",
  ...props
}: SheetFooterProps) {
  return (
    <SheetFooterPrimitive
      className={cn(sheetFooterVariants({ variant }), className)}
      {...props}
    />
  );
}

export type SheetTitlePrimitiveProps = BaseUISheet.Title.Props;

function SheetTitlePrimitive(props: SheetTitlePrimitiveProps) {
  return <BaseUISheet.Title data-slot="sheet-title" {...props} />;
}

export type SheetTitleProps = SheetTitlePrimitiveProps;

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetTitlePrimitive
      className={cn(sheetTitleVariants(), className)}
      {...props}
    />
  );
}

export type SheetDescriptionPrimitiveProps = BaseUISheet.Description.Props;

function SheetDescriptionPrimitive(props: SheetDescriptionPrimitiveProps) {
  return <BaseUISheet.Description data-slot="sheet-description" {...props} />;
}

export type SheetDescriptionProps = SheetDescriptionPrimitiveProps;

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetDescriptionPrimitive
      className={cn(sheetDescriptionVariants(), className)}
      {...props}
    />
  );
}

export interface SheetPanelPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  scrollFade?: boolean;
}

/** The scrolling body of the sheet, wrapped in a `ScrollArea`. */
function SheetPanelPrimitive({
  scrollFade = true,
  render,
  ...props
}: SheetPanelPrimitiveProps) {
  const defaultProps = {
    "data-slot": "sheet-panel",
  } as SheetPanelPrimitiveProps;
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

export type SheetPanelProps = SheetPanelPrimitiveProps;

function SheetPanel({ className, ...props }: SheetPanelProps) {
  return (
    <SheetPanelPrimitive
      className={cn(sheetPanelVariants(), className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetBackdrop,
  SheetBackdrop as SheetOverlay,
  SheetBackdropPrimitive,
  SheetClose,
  SheetDescription,
  SheetDescriptionPrimitive,
  SheetFooter,
  SheetFooterPrimitive,
  SheetHeader,
  SheetHeaderPrimitive,
  SheetPanel,
  SheetPanelPrimitive,
  SheetPopup,
  SheetPopup as SheetContent,
  SheetPopupPrimitive,
  SheetPortal,
  SheetTitle,
  SheetTitlePrimitive,
  SheetTrigger,
  SheetViewport,
  SheetViewportPrimitive,
  sheetBackdropVariants,
  sheetDescriptionVariants,
  sheetFooterVariants,
  sheetHeaderVariants,
  sheetPanelVariants,
  sheetPopupVariants,
  sheetTitleVariants,
  sheetViewportVariants,
};
