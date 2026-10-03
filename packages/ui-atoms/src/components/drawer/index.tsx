"use client";

import * as React from "react";
import { Checkbox as BaseUICheckbox } from "@base-ui/react/checkbox";
import { Drawer as BaseUIDrawer } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { Radio as BaseUIRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseUIRadioGroup } from "@base-ui/react/radio-group";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { ChevronRightIcon, XIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Button } from "../button/index.js";
import { ScrollArea } from "../scroll-area/index.js";

// DRW-1, swap 2 of 4: vaul → `@base-ui/react/drawer`. coss base
// `.coss-base/drawer.tsx` @8163481. `drawer` is not one of the fourteen the
// size-ramp hold-back names, so its `sm:` pairs are the base's verbatim.
//
// Breaking surface for consumers migrating from the earlier component: `DrawerOverlay` →
// `DrawerBackdrop`, and `DrawerContent` changes meaning — it is now Base UI's
// selection wrapper, not the panel.

export type DrawerPosition = "bottom" | "left" | "right" | "top";
export type DrawerVariant = "default" | "inset" | "straight";

const drawerBackdropVariants = cva({
  base: "fixed inset-0 z-50 bg-black/32 opacity-[calc(1-var(--drawer-swipe-progress))] backdrop-blur-sm transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute",
});

const drawerSwipeAreaVariants = cva({
  base: "fixed z-50 touch-none",
  defaultVariants: { position: "bottom" },
  variants: {
    position: {
      bottom: "inset-x-0 bottom-0 h-8",
      left: "inset-y-0 left-0 w-8",
      right: "inset-y-0 right-0 w-8",
      top: "inset-x-0 top-0 h-8",
    },
  },
});

const drawerViewportVariants = cva({
  base: "fixed inset-0 z-50 touch-none [--bleed:--spacing(12)] [--inset:0px]",
  compoundVariants: [
    { className: "pt-(--inset)", position: "left", variant: "inset" },
    { className: "pt-(--inset)", position: "right", variant: "inset" },
    { className: "pt-(--inset)", position: "top", variant: "inset" },
    { className: "pb-(--inset)", position: "bottom", variant: "inset" },
    { className: "pb-(--inset)", position: "left", variant: "inset" },
    { className: "pb-(--inset)", position: "right", variant: "inset" },
  ],
  defaultVariants: { position: "bottom", variant: "default" },
  variants: {
    position: {
      bottom: "grid grid-rows-[1fr_auto] pt-12",
      left: "flex justify-start",
      right: "flex justify-end",
      top: "grid grid-rows-[auto_1fr] pb-12",
    },
    variant: {
      default: "",
      inset: "px-(--inset) sm:[--inset:--spacing(4)]",
      straight: "",
    },
  },
});

const drawerPopupVariants = cva({
  base: "relative flex max-h-full min-h-0 w-full min-w-0 touch-none flex-col bg-popover not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 outline-none transition-[transform,box-shadow,height,background-color] duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform [--peek:calc(--spacing(6)-1px)] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] after:pointer-events-none after:absolute after:bg-popover data-swiping:select-none data-nested-drawer-open:overflow-hidden data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(2%*(var(--nested-drawers)-var(--stack-progress))))] data-ending-style:shadow-transparent data-starting-style:shadow-transparent data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] dark:data-nested-drawer-open:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(6%*(var(--nested-drawers)-var(--stack-progress))))] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  compoundVariants: [
    // Rounded corners: every variant but `straight`.
    { className: "rounded-t-2xl", position: "bottom", variant: "default" },
    { className: "rounded-t-2xl", position: "bottom", variant: "inset" },
    {
      className:
        "rounded-b-2xl **:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
      position: "top",
      variant: "default",
    },
    {
      className:
        "rounded-b-2xl **:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
      position: "top",
      variant: "inset",
    },
    {
      className:
        "rounded-e-2xl **:data-[slot=drawer-footer]:rounded-ee-[calc(var(--radius-2xl)-1px)]",
      position: "left",
      variant: "default",
    },
    {
      className:
        "rounded-e-2xl **:data-[slot=drawer-footer]:rounded-ee-[calc(var(--radius-2xl)-1px)]",
      position: "left",
      variant: "inset",
    },
    {
      className:
        "rounded-s-2xl **:data-[slot=drawer-footer]:rounded-es-[calc(var(--radius-2xl)-1px)]",
      position: "right",
      variant: "default",
    },
    {
      className:
        "rounded-s-2xl **:data-[slot=drawer-footer]:rounded-es-[calc(var(--radius-2xl)-1px)]",
      position: "right",
      variant: "inset",
    },
    // The `before:` inset highlight only exists on the `default` variant.
    {
      className: "before:rounded-t-[calc(var(--radius-2xl)-1px)]",
      position: "bottom",
      variant: "default",
    },
    {
      className: "before:rounded-b-[calc(var(--radius-2xl)-1px)]",
      position: "top",
      variant: "default",
    },
    {
      className: "before:rounded-e-[calc(var(--radius-2xl)-1px)]",
      position: "left",
      variant: "default",
    },
    {
      className: "before:rounded-s-[calc(var(--radius-2xl)-1px)]",
      position: "right",
      variant: "default",
    },
  ],
  defaultVariants: { position: "bottom", variant: "default" },
  variants: {
    position: {
      bottom:
        "transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))] data-ending-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))] data-starting-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))] row-start-2 -mb-[max(0px,calc(var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))] border-t pb-[max(0px,calc(env(safe-area-inset-bottom,0px)+var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))] not-data-starting-style:not-data-ending-style:transition-[transform,box-shadow,height,background-color,margin,padding] after:inset-x-0 after:top-full after:h-(--bleed) has-data-[slot=drawer-bar]:pt-2 data-ending-style:mb-0 data-starting-style:mb-0 data-ending-style:pb-0 data-starting-style:pb-0 h-(--drawer-height,auto) [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))] data-nested-drawer-open:h-(--height) data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] origin-[50%_calc(100%-var(--inset))]",
      left: "data-starting-style:transform-[translateX(calc(-100%-var(--inset)))] data-ending-style:transform-[translateX(calc(-100%-var(--inset)))] transform-[translateX(var(--drawer-swipe-movement-x))] w-[calc(100%-(--spacing(12)))] max-w-md border-e after:inset-y-0 after:end-full after:w-(--bleed) has-data-[slot=drawer-bar]:pe-2 data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)))_scale(var(--scale))] origin-right",
      right:
        "transform-[translateX(var(--drawer-swipe-movement-x))] data-ending-style:transform-[translateX(calc(100%+var(--inset)))] data-starting-style:transform-[translateX(calc(100%+var(--inset)))] col-start-2 w-[calc(100%-(--spacing(12)))] max-w-md border-s after:inset-y-0 after:start-full after:w-(--bleed) has-data-[slot=drawer-bar]:ps-2 data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--scale))] origin-left",
      top: "data-starting-style:transform-[translateY(calc(-100%-var(--inset)))] data-ending-style:transform-[translateY(calc(-100%-var(--inset)))] transform-[translateY(var(--drawer-swipe-movement-y))] border-b after:inset-x-0 after:bottom-full after:h-(--bleed) has-data-[slot=drawer-bar]:pb-2 h-(--drawer-height,auto) [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))] data-nested-drawer-open:h-(--height) data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--shrink)*var(--height))))_scale(var(--scale))] origin-[50%_var(--inset)]",
    },
    variant: {
      default: "",
      inset:
        "before:hidden sm:rounded-2xl sm:border sm:after:bg-transparent sm:before:rounded-[calc(var(--radius-2xl)-1px)] sm:**:data-[slot=drawer-footer]:rounded-b-[calc(var(--radius-2xl)-1px)]",
      straight: "[--stack-step:0]",
    },
  },
});

const drawerHeaderVariants = cva({
  base: "flex flex-col gap-2 p-6 in-[[data-slot=drawer-popup]:has([data-slot=drawer-panel])]:pb-3 max-sm:pb-4",
  defaultVariants: { allowSelection: false },
  variants: { allowSelection: { false: "cursor-default", true: "" } },
});

const drawerFooterVariants = cva({
  base: "flex flex-col-reverse gap-2 px-6 pb-(--safe-area-inset-bottom,0px) sm:flex-row sm:justify-end",
  defaultVariants: { allowSelection: true, variant: "default" },
  variants: {
    allowSelection: { false: "cursor-default", true: "" },
    variant: {
      bare: "in-[[data-slot=drawer-popup]:has([data-slot=drawer-panel])]:pt-3 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(6))]",
      default:
        "border-t bg-muted/72 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+--spacing(4))]",
    },
  },
});

const drawerTitleVariants = cva({
  base: "font-heading font-semibold text-xl leading-none",
});

const drawerDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

const drawerPanelVariants = cva({
  base: "p-6 in-[[data-slot=drawer-popup]:has([data-slot=drawer-header])]:pt-1 in-[[data-slot=drawer-popup]:has([data-slot=drawer-footer]:not(.border-t))]:pb-1",
  defaultVariants: { allowSelection: true },
  variants: { allowSelection: { false: "cursor-default", true: "" } },
});

const drawerBarVariants = cva({
  base: "absolute flex touch-none items-center justify-center p-3 before:rounded-full before:bg-input",
  defaultVariants: { position: "bottom" },
  variants: {
    position: {
      bottom: "inset-x-0 before:h-1 before:w-12 top-0",
      left: "inset-y-0 before:h-12 before:w-1 right-0",
      right: "inset-y-0 before:h-12 before:w-1 left-0",
      top: "inset-x-0 before:h-1 before:w-12 bottom-0",
    },
  },
});

const drawerMenuVariants = cva({ base: "-m-2 flex flex-col" });

const drawerMenuItemVariants = cva({
  base: "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-64 data-[variant=destructive]:text-destructive-foreground sm:min-h-8 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0",
});

const drawerMenuSeparatorVariants = cva({ base: "mx-2 my-1 h-px bg-border" });
const drawerMenuGroupVariants = cva({ base: "flex flex-col" });
const drawerMenuGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
});

const drawerMenuTriggerVariants = cva({
  base: "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground sm:min-h-8 sm:text-sm [&_svg:not(:last-child)]:-mx-0.5 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const drawerMenuCheckboxItemVariants = cva({
  base: "grid min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "grid-cols-[1rem_minmax(0,1fr)] pe-4",
      switch: "grid-cols-[minmax(0,1fr)_auto] gap-4 pe-1.5",
    },
  },
});

const drawerMenuRadioGroupVariants = cva({ base: "flex flex-col" });

const drawerMenuRadioItemVariants = cva({
  base: "grid min-h-9 w-full cursor-default select-none grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-sm px-2 py-1 pe-4 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
});

const DrawerContext = React.createContext<{ position: DrawerPosition }>({
  position: "bottom",
});

const directionMap: Record<
  DrawerPosition,
  BaseUIDrawer.Root.Props["swipeDirection"]
> = { bottom: "down", left: "left", right: "right", top: "up" };

const DrawerCreateHandle = BaseUIDrawer.createHandle;
const DrawerPortal = BaseUIDrawer.Portal;
const DrawerContent = BaseUIDrawer.Content;

export interface DrawerProps extends BaseUIDrawer.Root.Props {
  position?: DrawerPosition;
}

function Drawer({
  position = "bottom",
  swipeDirection,
  ...props
}: DrawerProps) {
  return (
    <DrawerContext.Provider value={{ position }}>
      <BaseUIDrawer.Root
        swipeDirection={swipeDirection ?? directionMap[position]}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

export type DrawerTriggerProps = BaseUIDrawer.Trigger.Props;

function DrawerTrigger(props: DrawerTriggerProps) {
  return <BaseUIDrawer.Trigger data-slot="drawer-trigger" {...props} />;
}

export type DrawerCloseProps = BaseUIDrawer.Close.Props;

function DrawerClose(props: DrawerCloseProps) {
  return <BaseUIDrawer.Close data-slot="drawer-close" {...props} />;
}

export interface DrawerSwipeAreaPrimitiveProps
  extends BaseUIDrawer.SwipeArea.Props {
  position?: DrawerPosition;
}

function DrawerSwipeAreaPrimitive({
  position: _position,
  ...props
}: DrawerSwipeAreaPrimitiveProps) {
  return <BaseUIDrawer.SwipeArea data-slot="drawer-swipe-area" {...props} />;
}

export type DrawerSwipeAreaProps = DrawerSwipeAreaPrimitiveProps;

function DrawerSwipeArea({
  className,
  position: positionProp,
  ...props
}: DrawerSwipeAreaProps) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerSwipeAreaPrimitive
      className={cn(drawerSwipeAreaVariants({ position }), className)}
      {...props}
    />
  );
}

export type DrawerBackdropPrimitiveProps = BaseUIDrawer.Backdrop.Props;

function DrawerBackdropPrimitive(props: DrawerBackdropPrimitiveProps) {
  return <BaseUIDrawer.Backdrop data-slot="drawer-backdrop" {...props} />;
}

export type DrawerBackdropProps = DrawerBackdropPrimitiveProps;

function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return (
    <DrawerBackdropPrimitive
      className={cn(drawerBackdropVariants(), className)}
      {...props}
    />
  );
}

export type DrawerViewportPrimitiveProps = BaseUIDrawer.Viewport.Props;

function DrawerViewportPrimitive(props: DrawerViewportPrimitiveProps) {
  return <BaseUIDrawer.Viewport data-slot="drawer-viewport" {...props} />;
}

export interface DrawerViewportProps extends DrawerViewportPrimitiveProps {
  position?: DrawerPosition;
  variant?: DrawerVariant;
}

function DrawerViewport({
  className,
  position = "bottom",
  variant = "default",
  ...props
}: DrawerViewportProps) {
  return (
    <DrawerViewportPrimitive
      className={cn(drawerViewportVariants({ position, variant }), className)}
      {...props}
    />
  );
}

export interface DrawerPopupPrimitiveProps extends BaseUIDrawer.Popup.Props {
  portalProps?: BaseUIDrawer.Portal.Props;
  position?: DrawerPosition;
  /** Renders the drag bar that tells a touch user the sheet is swipeable. */
  showBar?: boolean;
  /** Renders the top-end close control. */
  showCloseButton?: boolean;
  variant?: DrawerVariant;
}

/**
 * Portal → Backdrop → Viewport → Popup. Backdrop and Viewport are composed here
 * as their styled parts, exactly as the base does. The close control's
 * `absolute end-2 top-2 z-1` is placement, not theme styling.
 */
function DrawerPopupPrimitive({
  children,
  portalProps,
  position: positionProp,
  showBar = false,
  showCloseButton = false,
  variant = "default",
  ...props
}: DrawerPopupPrimitiveProps) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerPortal {...portalProps}>
      <DrawerBackdrop />
      <DrawerViewport position={position} variant={variant}>
        <BaseUIDrawer.Popup data-slot="drawer-popup" {...props}>
          {children}
          {showCloseButton && (
            <BaseUIDrawer.Close
              aria-label="Close"
              className="absolute end-2 top-2 z-1"
              render={<Button size="icon" variant="ghost" />}
            >
              <XIcon />
            </BaseUIDrawer.Close>
          )}
          {showBar && <DrawerBar position={position} />}
        </BaseUIDrawer.Popup>
      </DrawerViewport>
    </DrawerPortal>
  );
}

export type DrawerPopupProps = DrawerPopupPrimitiveProps;

function DrawerPopup({
  className,
  position: positionProp,
  variant = "default",
  ...props
}: DrawerPopupProps) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerPopupPrimitive
      className={cn(drawerPopupVariants({ position, variant }), className)}
      position={position}
      variant={variant}
      {...props}
    />
  );
}

export interface DrawerHeaderPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  /** When false the header is drag-only; when true it wraps in `DrawerContent`
   *  so text inside it can be selected. */
  allowSelection?: boolean;
}

function DrawerHeaderPrimitive({
  allowSelection = false,
  render,
  ...props
}: DrawerHeaderPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-header",
  } as DrawerHeaderPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  });
}

export type DrawerHeaderProps = DrawerHeaderPrimitiveProps;

function DrawerHeader({
  allowSelection = false,
  className,
  ...props
}: DrawerHeaderProps) {
  return (
    <DrawerHeaderPrimitive
      allowSelection={allowSelection}
      className={cn(drawerHeaderVariants({ allowSelection }), className)}
      {...props}
    />
  );
}

export interface DrawerFooterPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  allowSelection?: boolean;
}

function DrawerFooterPrimitive({
  allowSelection = true,
  render,
  ...props
}: DrawerFooterPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-footer",
  } as DrawerFooterPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  });
}

export interface DrawerFooterProps extends DrawerFooterPrimitiveProps {
  variant?: "bare" | "default";
}

function DrawerFooter({
  allowSelection = true,
  className,
  variant = "default",
  ...props
}: DrawerFooterProps) {
  return (
    <DrawerFooterPrimitive
      allowSelection={allowSelection}
      className={cn(
        drawerFooterVariants({ allowSelection, variant }),
        className,
      )}
      {...props}
    />
  );
}

export type DrawerTitlePrimitiveProps = BaseUIDrawer.Title.Props;

function DrawerTitlePrimitive(props: DrawerTitlePrimitiveProps) {
  return <BaseUIDrawer.Title data-slot="drawer-title" {...props} />;
}

export type DrawerTitleProps = DrawerTitlePrimitiveProps;

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerTitlePrimitive
      className={cn(drawerTitleVariants(), className)}
      {...props}
    />
  );
}

export type DrawerDescriptionPrimitiveProps = BaseUIDrawer.Description.Props;

function DrawerDescriptionPrimitive(props: DrawerDescriptionPrimitiveProps) {
  return <BaseUIDrawer.Description data-slot="drawer-description" {...props} />;
}

export type DrawerDescriptionProps = DrawerDescriptionPrimitiveProps;

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerDescriptionPrimitive
      className={cn(drawerDescriptionVariants(), className)}
      {...props}
    />
  );
}

export interface DrawerPanelPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  allowSelection?: boolean;
  scrollFade?: boolean;
  scrollable?: boolean;
}

function DrawerPanelPrimitive({
  allowSelection = true,
  render,
  scrollFade = true,
  scrollable = true,
  ...props
}: DrawerPanelPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-panel",
  } as DrawerPanelPrimitiveProps;

  const content = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  });

  if (scrollable) {
    return (
      <ScrollArea
        className="touch-auto"
        overscrollContain={true}
        scrollFade={scrollFade}
      >
        {content}
      </ScrollArea>
    );
  }

  return content;
}

export type DrawerPanelProps = DrawerPanelPrimitiveProps;

function DrawerPanel({
  allowSelection = true,
  className,
  ...props
}: DrawerPanelProps) {
  return (
    <DrawerPanelPrimitive
      allowSelection={allowSelection}
      className={cn(drawerPanelVariants({ allowSelection }), className)}
      {...props}
    />
  );
}

export interface DrawerBarPrimitiveProps
  extends useRender.ComponentProps<"div"> {
  position?: DrawerPosition;
}

function DrawerBarPrimitive({
  position: _position,
  render,
  ...props
}: DrawerBarPrimitiveProps) {
  const defaultProps = {
    "aria-hidden": true as const,
    "data-slot": "drawer-bar",
  } as DrawerBarPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type DrawerBarProps = DrawerBarPrimitiveProps;

function DrawerBar({
  className,
  position: positionProp,
  ...props
}: DrawerBarProps) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerBarPrimitive
      className={cn(drawerBarVariants({ position }), className)}
      {...props}
    />
  );
}

export type DrawerMenuPrimitiveProps = useRender.ComponentProps<"nav">;

function DrawerMenuPrimitive({ render, ...props }: DrawerMenuPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-menu",
  } as DrawerMenuPrimitiveProps;

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(defaultProps, props),
    render,
  });
}

export type DrawerMenuProps = DrawerMenuPrimitiveProps;

function DrawerMenu({ className, ...props }: DrawerMenuProps) {
  return (
    <DrawerMenuPrimitive
      className={cn(drawerMenuVariants(), className)}
      {...props}
    />
  );
}

export interface DrawerMenuItemPrimitiveProps
  extends useRender.ComponentProps<"button"> {
  variant?: "default" | "destructive";
}

function DrawerMenuItemPrimitive({
  render,
  variant = "default",
  ...props
}: DrawerMenuItemPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-menu-item",
    "data-variant": variant,
    type: "button" as const,
  } as DrawerMenuItemPrimitiveProps;

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

export type DrawerMenuItemProps = DrawerMenuItemPrimitiveProps;

function DrawerMenuItem({ className, ...props }: DrawerMenuItemProps) {
  return (
    <DrawerMenuItemPrimitive
      className={cn(drawerMenuItemVariants(), className)}
      {...props}
    />
  );
}

export type DrawerMenuSeparatorPrimitiveProps = useRender.ComponentProps<"div">;

function DrawerMenuSeparatorPrimitive({
  render,
  ...props
}: DrawerMenuSeparatorPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-menu-separator",
  } as DrawerMenuSeparatorPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type DrawerMenuSeparatorProps = DrawerMenuSeparatorPrimitiveProps;

function DrawerMenuSeparator({
  className,
  ...props
}: DrawerMenuSeparatorProps) {
  return (
    <DrawerMenuSeparatorPrimitive
      className={cn(drawerMenuSeparatorVariants(), className)}
      {...props}
    />
  );
}

export type DrawerMenuGroupPrimitiveProps = useRender.ComponentProps<"div">;

function DrawerMenuGroupPrimitive({
  render,
  ...props
}: DrawerMenuGroupPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-menu-group",
  } as DrawerMenuGroupPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type DrawerMenuGroupProps = DrawerMenuGroupPrimitiveProps;

function DrawerMenuGroup({ className, ...props }: DrawerMenuGroupProps) {
  return (
    <DrawerMenuGroupPrimitive
      className={cn(drawerMenuGroupVariants(), className)}
      {...props}
    />
  );
}

export type DrawerMenuGroupLabelPrimitiveProps =
  useRender.ComponentProps<"div">;

function DrawerMenuGroupLabelPrimitive({
  render,
  ...props
}: DrawerMenuGroupLabelPrimitiveProps) {
  const defaultProps = {
    "data-slot": "drawer-menu-group-label",
  } as DrawerMenuGroupLabelPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

export type DrawerMenuGroupLabelProps = DrawerMenuGroupLabelPrimitiveProps;

function DrawerMenuGroupLabel({
  className,
  ...props
}: DrawerMenuGroupLabelProps) {
  return (
    <DrawerMenuGroupLabelPrimitive
      className={cn(drawerMenuGroupLabelVariants(), className)}
      {...props}
    />
  );
}

export type DrawerMenuTriggerProps = BaseUIDrawer.Trigger.Props;

function DrawerMenuTrigger({
  children,
  className,
  ...props
}: DrawerMenuTriggerProps) {
  return (
    <DrawerTrigger
      className={cn(drawerMenuTriggerVariants(), className)}
      data-slot="drawer-menu-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto -me-0.5 opacity-80" />
    </DrawerTrigger>
  );
}

/** The tick the check-style indicators draw. Inlined by the base as an svg. */
function CheckPath() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
    </svg>
  );
}

export interface DrawerMenuCheckboxItemPrimitiveProps
  extends BaseUICheckbox.Root.Props {
  variant?: "default" | "switch";
}

function DrawerMenuCheckboxItemPrimitive({
  children,
  variant = "default",
  ...props
}: DrawerMenuCheckboxItemPrimitiveProps) {
  return (
    <BaseUICheckbox.Root data-slot="drawer-menu-checkbox-item" {...props}>
      {variant === "switch" ? (
        <>
          <span className="wrap-anywhere col-start-1 min-w-0">{children}</span>
          <BaseUICheckbox.Indicator
            className="inset-shadow-[0_1px_--theme(--color-black/4%)] col-start-2 inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:--spacing(4)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64 sm:[--thumb-size:--spacing(3)]"
            keepMounted={true}
          >
            <span className="pointer-events-none block aspect-square h-full in-[[data-slot=drawer-menu-checkbox-item][data-checked]]:origin-[var(--thumb-size)_50%] origin-left in-[[data-slot=drawer-menu-checkbox-item][data-checked]]:translate-x-[calc(var(--thumb-size)-4px)] in-[[data-slot=drawer-menu-checkbox-item]:active]:not-data-disabled:scale-x-110 in-[[data-slot=drawer-menu-checkbox-item]:active]:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.10)] rounded-(--thumb-size) bg-background shadow-sm/5 will-change-transform [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]" />
          </BaseUICheckbox.Indicator>
        </>
      ) : (
        <>
          <BaseUICheckbox.Indicator className="col-start-1">
            <CheckPath />
          </BaseUICheckbox.Indicator>
          <span className="wrap-anywhere col-start-2 min-w-0">{children}</span>
        </>
      )}
    </BaseUICheckbox.Root>
  );
}

export type DrawerMenuCheckboxItemProps = DrawerMenuCheckboxItemPrimitiveProps;

function DrawerMenuCheckboxItem({
  className,
  variant = "default",
  ...props
}: DrawerMenuCheckboxItemProps) {
  return (
    <DrawerMenuCheckboxItemPrimitive
      className={cn(drawerMenuCheckboxItemVariants({ variant }), className)}
      variant={variant}
      {...props}
    />
  );
}

export type DrawerMenuRadioGroupPrimitiveProps = BaseUIRadioGroup.Props;

function DrawerMenuRadioGroupPrimitive(
  props: DrawerMenuRadioGroupPrimitiveProps,
) {
  return <BaseUIRadioGroup data-slot="drawer-menu-radio-group" {...props} />;
}

export type DrawerMenuRadioGroupProps = DrawerMenuRadioGroupPrimitiveProps;

function DrawerMenuRadioGroup({
  className,
  ...props
}: DrawerMenuRadioGroupProps) {
  return (
    <DrawerMenuRadioGroupPrimitive
      className={cn(drawerMenuRadioGroupVariants(), className)}
      {...props}
    />
  );
}

export type DrawerMenuRadioItemPrimitiveProps = BaseUIRadio.Root.Props;

function DrawerMenuRadioItemPrimitive({
  children,
  ...props
}: DrawerMenuRadioItemPrimitiveProps) {
  return (
    <BaseUIRadio.Root data-slot="drawer-menu-radio-item" {...props}>
      <BaseUIRadio.Indicator className="col-start-1">
        <CheckPath />
      </BaseUIRadio.Indicator>
      <span className="wrap-anywhere col-start-2 min-w-0">{children}</span>
    </BaseUIRadio.Root>
  );
}

export type DrawerMenuRadioItemProps = DrawerMenuRadioItemPrimitiveProps;

function DrawerMenuRadioItem({
  className,
  ...props
}: DrawerMenuRadioItemProps) {
  return (
    <DrawerMenuRadioItemPrimitive
      className={cn(drawerMenuRadioItemVariants(), className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBackdrop,
  DrawerBackdropPrimitive,
  DrawerBar,
  DrawerBarPrimitive,
  DrawerClose,
  DrawerContent,
  DrawerCreateHandle,
  DrawerDescription,
  DrawerDescriptionPrimitive,
  DrawerFooter,
  DrawerFooterPrimitive,
  DrawerHeader,
  DrawerHeaderPrimitive,
  DrawerMenu,
  DrawerMenuCheckboxItem,
  DrawerMenuCheckboxItemPrimitive,
  DrawerMenuGroup,
  DrawerMenuGroupLabel,
  DrawerMenuGroupLabelPrimitive,
  DrawerMenuGroupPrimitive,
  DrawerMenuItem,
  DrawerMenuItemPrimitive,
  DrawerMenuPrimitive,
  DrawerMenuRadioGroup,
  DrawerMenuRadioGroupPrimitive,
  DrawerMenuRadioItem,
  DrawerMenuRadioItemPrimitive,
  DrawerMenuSeparator,
  DrawerMenuSeparatorPrimitive,
  DrawerMenuTrigger,
  DrawerPanel,
  DrawerPanelPrimitive,
  DrawerPopup,
  DrawerPopupPrimitive,
  DrawerPortal,
  DrawerSwipeArea,
  DrawerSwipeAreaPrimitive,
  DrawerTitle,
  DrawerTitlePrimitive,
  DrawerTrigger,
  DrawerViewport,
  DrawerViewportPrimitive,
  drawerBackdropVariants,
  drawerBarVariants,
  drawerDescriptionVariants,
  drawerFooterVariants,
  drawerHeaderVariants,
  drawerMenuCheckboxItemVariants,
  drawerMenuGroupLabelVariants,
  drawerMenuGroupVariants,
  drawerMenuItemVariants,
  drawerMenuRadioGroupVariants,
  drawerMenuRadioItemVariants,
  drawerMenuSeparatorVariants,
  drawerMenuTriggerVariants,
  drawerMenuVariants,
  drawerPanelVariants,
  drawerPopupVariants,
  drawerSwipeAreaVariants,
  drawerTitleVariants,
  drawerViewportVariants,
};
