import { Popover as BaseUIPopover } from "@base-ui/react/popover";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/popover.tsx` @8163481, taken wholesale. POP-2: the base
// carries no min-width rule at all, so the invalid `not-[class*='w-']:[min-w-80]`
// is gone and a call site that wants a floor passes its own `w-`/`min-w-`.

const popoverPopupVariants = cva({
  base: "relative flex h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 outline-none transition-[width,height,scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] has-data-[slot=calendar]:rounded-xl has-data-[slot=calendar]:before:rounded-[calc(var(--radius-xl)-1px)] data-starting-style:scale-98 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  defaultVariants: { tooltipStyle: false },
  variants: {
    tooltipStyle: {
      false: "",
      true: "w-fit text-balance rounded-md text-xs shadow-md/5 before:rounded-[calc(var(--radius-md)-1px)]",
    },
  },
});

const popoverViewportVariants = cva({
  base: "relative size-full max-h-(--available-height) overflow-clip px-(--viewport-inline-padding) py-4 [--viewport-inline-padding:--spacing(4)] has-data-[slot=calendar]:p-2 data-instant:transition-none **:data-current:data-ending-style:opacity-0 **:data-current:data-starting-style:opacity-0 **:data-previous:data-ending-style:opacity-0 **:data-previous:data-starting-style:opacity-0 **:data-current:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding)-2px)] **:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-inline-padding)-2px)] **:data-current:opacity-100 **:data-previous:opacity-100 **:data-current:transition-opacity **:data-previous:transition-opacity",
  defaultVariants: { tooltipStyle: false },
  variants: {
    tooltipStyle: {
      false: "not-data-transitioning:overflow-y-auto",
      true: "py-1 [--viewport-inline-padding:--spacing(2)]",
    },
  },
});

const popoverTitleVariants = cva({
  base: "font-semibold text-lg leading-none",
});

const popoverDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

const PopoverCreateHandle = BaseUIPopover.createHandle;
const Popover = BaseUIPopover.Root;

export type PopoverTriggerProps = BaseUIPopover.Trigger.Props;

function PopoverTrigger(props: PopoverTriggerProps) {
  return <BaseUIPopover.Trigger data-slot="popover-trigger" {...props} />;
}

export interface PopoverPopupPrimitiveProps extends BaseUIPopover.Popup.Props {
  align?: BaseUIPopover.Positioner.Props["align"];
  alignOffset?: BaseUIPopover.Positioner.Props["alignOffset"];
  anchor?: BaseUIPopover.Positioner.Props["anchor"];
  portalProps?: BaseUIPopover.Portal.Props;
  side?: BaseUIPopover.Positioner.Props["side"];
  sideOffset?: BaseUIPopover.Positioner.Props["sideOffset"];
}

interface PopoverPopupPrimitiveInternalProps
  extends PopoverPopupPrimitiveProps {
  /** Internal channel for the viewport's class set. */
  viewportClassName?: string;
}

/**
 * Portal + positioner + popup + viewport. The positioner's classes are layering
 * and measurement (structural), not theme styling, and stay here.
 */
function PopoverPopupPrimitive({
  align = "center",
  alignOffset = 0,
  anchor,
  children,
  portalProps,
  side = "bottom",
  sideOffset = 4,
  viewportClassName,
  ...props
}: PopoverPopupPrimitiveInternalProps) {
  return (
    <BaseUIPopover.Portal {...portalProps}>
      <BaseUIPopover.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] data-instant:transition-none"
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseUIPopover.Popup data-slot="popover-popup" {...props}>
          <BaseUIPopover.Viewport
            className={viewportClassName}
            data-slot="popover-viewport"
          >
            {children}
          </BaseUIPopover.Viewport>
        </BaseUIPopover.Popup>
      </BaseUIPopover.Positioner>
    </BaseUIPopover.Portal>
  );
}

export interface PopoverPopupProps extends PopoverPopupPrimitiveProps {
  /** Renders the popup at tooltip density (narrower padding, smaller text). */
  tooltipStyle?: boolean;
}

function PopoverPopup({
  className,
  tooltipStyle = false,
  ...props
}: PopoverPopupProps) {
  return (
    <PopoverPopupPrimitive
      className={cn(popoverPopupVariants({ tooltipStyle }), className)}
      viewportClassName={cn(popoverViewportVariants({ tooltipStyle }))}
      {...props}
    />
  );
}

export type PopoverCloseProps = BaseUIPopover.Close.Props;

function PopoverClose(props: PopoverCloseProps) {
  return <BaseUIPopover.Close data-slot="popover-close" {...props} />;
}

export type PopoverTitlePrimitiveProps = BaseUIPopover.Title.Props;

function PopoverTitlePrimitive(props: PopoverTitlePrimitiveProps) {
  return <BaseUIPopover.Title data-slot="popover-title" {...props} />;
}

export type PopoverTitleProps = PopoverTitlePrimitiveProps;

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <PopoverTitlePrimitive
      className={cn(popoverTitleVariants(), className)}
      {...props}
    />
  );
}

export type PopoverDescriptionPrimitiveProps = BaseUIPopover.Description.Props;

function PopoverDescriptionPrimitive(props: PopoverDescriptionPrimitiveProps) {
  return (
    <BaseUIPopover.Description data-slot="popover-description" {...props} />
  );
}

export type PopoverDescriptionProps = PopoverDescriptionPrimitiveProps;

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverDescriptionPrimitive
      className={cn(popoverDescriptionVariants(), className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverClose,
  PopoverCreateHandle,
  PopoverDescription,
  PopoverDescriptionPrimitive,
  PopoverPopup,
  // The base ships this alias itself, so the retirement of shadcn aliases
  // does not reach it (same exception as `CardContent`).
  PopoverPopup as PopoverContent,
  PopoverPopupPrimitive,
  PopoverTitle,
  PopoverTitlePrimitive,
  PopoverTrigger,
  popoverDescriptionVariants,
  popoverPopupVariants,
  popoverTitleVariants,
  popoverViewportVariants,
};
