import type * as React from "react";
import { ContextMenu as BaseUIContextMenu } from "@base-ui/react/context-menu";
import { cva } from "cva";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "../../utils.js";

// CTX-1, adopted provisionally: coss base `.coss-base/context-menu.tsx`
// @8163481, taken wholesale and split into styled/primitive/variants triples.
//
// The size-ramp hold-back (see `__tests__/size-ramp-holdback.test.ts`) does NOT
// reach this file: it names fourteen components and `context-menu` is not one
// of them (it is brand new here, so
// there is no fixed tilli size to hold on to), and the rule is "those fourteen
// and nowhere else". The `sm:` pairs below are therefore upstream's, verbatim.

const contextMenuPopupVariants = cva({
  base: "relative flex not-[class*='w-']:min-w-32 origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus:outline-none dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const contextMenuItemVariants = cva({
  base: "flex min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:ps-8 data-[variant=destructive]:text-destructive-foreground data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0",
});

const contextMenuCheckboxItemVariants = cva({
  base: "grid min-h-8 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default items-center gap-2 rounded-sm py-1 ps-2 text-base text-foreground outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "grid-cols-[.75rem_1fr] pe-4",
      switch: "grid-cols-[1fr_auto] gap-4 pe-1.5",
    },
  },
});

const contextMenuRadioItemVariants = cva({
  base: "grid min-h-8 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[.75rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-base text-foreground outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const contextMenuGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs data-inset:ps-9 sm:data-inset:ps-8",
});

const contextMenuSeparatorVariants = cva({ base: "mx-2 my-1 h-px bg-border" });

const contextMenuShortcutVariants = cva({
  base: "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
});

const contextMenuSubTriggerVariants = cva({
  base: "flex min-h-8 items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-popup-open:bg-accent data-inset:ps-8 data-highlighted:text-accent-foreground data-popup-open:text-accent-foreground data-disabled:opacity-64 sm:min-h-7 sm:text-sm [&>svg:not(:last-child)]:-mx-0.5 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
});

const ContextMenu = BaseUIContextMenu.Root;
const ContextMenuPortal = BaseUIContextMenu.Portal;

export type ContextMenuTriggerProps = BaseUIContextMenu.Trigger.Props;

function ContextMenuTrigger(props: ContextMenuTriggerProps) {
  return (
    <BaseUIContextMenu.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

export type ContextMenuGroupProps = BaseUIContextMenu.Group.Props;

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <BaseUIContextMenu.Group data-slot="context-menu-group" {...props} />;
}

export type ContextMenuRadioGroupProps = BaseUIContextMenu.RadioGroup.Props;

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return (
    <BaseUIContextMenu.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

export type ContextMenuSubProps = BaseUIContextMenu.SubmenuRoot.Props;

function ContextMenuSub(props: ContextMenuSubProps) {
  return (
    <BaseUIContextMenu.SubmenuRoot data-slot="context-menu-sub" {...props} />
  );
}

export interface ContextMenuPopupPrimitiveProps
  extends BaseUIContextMenu.Popup.Props {
  align?: BaseUIContextMenu.Positioner.Props["align"];
  alignOffset?: BaseUIContextMenu.Positioner.Props["alignOffset"];
  anchor?: BaseUIContextMenu.Positioner.Props["anchor"];
  portalProps?: BaseUIContextMenu.Portal.Props;
  side?: BaseUIContextMenu.Positioner.Props["side"];
  sideOffset?: BaseUIContextMenu.Positioner.Props["sideOffset"];
}

/** Portal + positioner + popup + the scrolling inner pane. */
function ContextMenuPopupPrimitive({
  align = "center",
  alignOffset,
  anchor,
  children,
  portalProps,
  side = "bottom",
  sideOffset = 4,
  ...props
}: ContextMenuPopupPrimitiveProps) {
  return (
    <ContextMenuPortal {...portalProps}>
      <BaseUIContextMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50"
        data-slot="context-menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseUIContextMenu.Popup data-slot="context-menu-popup" {...props}>
          <div className="max-h-(--available-height) w-full overflow-y-auto p-1">
            {children}
          </div>
        </BaseUIContextMenu.Popup>
      </BaseUIContextMenu.Positioner>
    </ContextMenuPortal>
  );
}

export type ContextMenuPopupProps = ContextMenuPopupPrimitiveProps;

function ContextMenuPopup({ className, ...props }: ContextMenuPopupProps) {
  return (
    <ContextMenuPopupPrimitive
      className={cn(contextMenuPopupVariants(), className)}
      {...props}
    />
  );
}

export interface ContextMenuItemPrimitiveProps
  extends BaseUIContextMenu.Item.Props {
  inset?: boolean;
  variant?: "default" | "destructive";
}

function ContextMenuItemPrimitive({
  inset,
  variant = "default",
  ...props
}: ContextMenuItemPrimitiveProps) {
  return (
    <BaseUIContextMenu.Item
      data-inset={inset}
      data-slot="context-menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

export type ContextMenuItemProps = ContextMenuItemPrimitiveProps;

function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  return (
    <ContextMenuItemPrimitive
      className={cn(contextMenuItemVariants(), className)}
      {...props}
    />
  );
}

export interface ContextMenuLinkItemPrimitiveProps
  extends BaseUIContextMenu.LinkItem.Props {
  inset?: boolean;
  variant?: "default" | "destructive";
}

function ContextMenuLinkItemPrimitive({
  closeOnClick = true,
  inset,
  variant = "default",
  ...props
}: ContextMenuLinkItemPrimitiveProps) {
  return (
    <BaseUIContextMenu.LinkItem
      closeOnClick={closeOnClick}
      data-inset={inset}
      data-slot="context-menu-link-item"
      data-variant={variant}
      {...props}
    />
  );
}

export type ContextMenuLinkItemProps = ContextMenuLinkItemPrimitiveProps;

function ContextMenuLinkItem({
  className,
  ...props
}: ContextMenuLinkItemProps) {
  return (
    <ContextMenuLinkItemPrimitive
      className={cn(contextMenuItemVariants(), className)}
      {...props}
    />
  );
}

/** The tick the check-style indicator draws. Inlined by the base as an svg. */
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

export interface ContextMenuCheckboxItemPrimitiveProps
  extends BaseUIContextMenu.CheckboxItem.Props {
  variant?: "default" | "switch";
}

function ContextMenuCheckboxItemPrimitive({
  children,
  variant = "default",
  ...props
}: ContextMenuCheckboxItemPrimitiveProps) {
  return (
    <BaseUIContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      {...props}
    >
      {variant === "switch" ? (
        <>
          <span className="col-start-1">{children}</span>
          <BaseUIContextMenu.CheckboxItemIndicator
            className="inset-shadow-[0_1px_--theme(--color-black/4%)] inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:--spacing(4)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64 sm:[--thumb-size:--spacing(3)]"
            keepMounted={true}
          >
            <span className="pointer-events-none block aspect-square h-full in-[[data-slot=context-menu-checkbox-item][data-checked]]:origin-[var(--thumb-size)_50%] origin-left in-[[data-slot=context-menu-checkbox-item][data-checked]]:translate-x-[calc(var(--thumb-size)-4px)] in-[[data-slot=context-menu-checkbox-item]:active]:not-data-disabled:scale-x-110 in-[[data-slot=context-menu-checkbox-item]:active]:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.10)] rounded-(--thumb-size) bg-background shadow-sm/5 will-change-transform [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]" />
          </BaseUIContextMenu.CheckboxItemIndicator>
        </>
      ) : (
        <>
          <BaseUIContextMenu.CheckboxItemIndicator className="col-start-1 -ms-0.5">
            <CheckPath />
          </BaseUIContextMenu.CheckboxItemIndicator>
          <span className="col-start-2">{children}</span>
        </>
      )}
    </BaseUIContextMenu.CheckboxItem>
  );
}

export type ContextMenuCheckboxItemProps =
  ContextMenuCheckboxItemPrimitiveProps;

function ContextMenuCheckboxItem({
  className,
  variant = "default",
  ...props
}: ContextMenuCheckboxItemProps) {
  return (
    <ContextMenuCheckboxItemPrimitive
      className={cn(contextMenuCheckboxItemVariants({ variant }), className)}
      variant={variant}
      {...props}
    />
  );
}

export type ContextMenuRadioItemPrimitiveProps =
  BaseUIContextMenu.RadioItem.Props;

function ContextMenuRadioItemPrimitive({
  children,
  ...props
}: ContextMenuRadioItemPrimitiveProps) {
  return (
    <BaseUIContextMenu.RadioItem data-slot="context-menu-radio-item" {...props}>
      <BaseUIContextMenu.RadioItemIndicator className="col-start-1 -ms-0.5">
        <CheckPath />
      </BaseUIContextMenu.RadioItemIndicator>
      <span className="col-start-2">{children}</span>
    </BaseUIContextMenu.RadioItem>
  );
}

export type ContextMenuRadioItemProps = ContextMenuRadioItemPrimitiveProps;

function ContextMenuRadioItem({
  className,
  ...props
}: ContextMenuRadioItemProps) {
  return (
    <ContextMenuRadioItemPrimitive
      className={cn(contextMenuRadioItemVariants(), className)}
      {...props}
    />
  );
}

export interface ContextMenuGroupLabelPrimitiveProps
  extends BaseUIContextMenu.GroupLabel.Props {
  inset?: boolean;
}

function ContextMenuGroupLabelPrimitive({
  inset,
  ...props
}: ContextMenuGroupLabelPrimitiveProps) {
  return (
    <BaseUIContextMenu.GroupLabel
      data-inset={inset}
      data-slot="context-menu-label"
      {...props}
    />
  );
}

export type ContextMenuGroupLabelProps = ContextMenuGroupLabelPrimitiveProps;

function ContextMenuGroupLabel({
  className,
  ...props
}: ContextMenuGroupLabelProps) {
  return (
    <ContextMenuGroupLabelPrimitive
      className={cn(contextMenuGroupLabelVariants(), className)}
      {...props}
    />
  );
}

export type ContextMenuSeparatorPrimitiveProps =
  BaseUIContextMenu.Separator.Props;

function ContextMenuSeparatorPrimitive(
  props: ContextMenuSeparatorPrimitiveProps,
) {
  return (
    <BaseUIContextMenu.Separator
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

export type ContextMenuSeparatorProps = ContextMenuSeparatorPrimitiveProps;

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuSeparatorProps) {
  return (
    <ContextMenuSeparatorPrimitive
      className={cn(contextMenuSeparatorVariants(), className)}
      {...props}
    />
  );
}

export type ContextMenuShortcutPrimitiveProps = React.ComponentProps<"kbd">;

function ContextMenuShortcutPrimitive(
  props: ContextMenuShortcutPrimitiveProps,
) {
  return <kbd data-slot="context-menu-shortcut" {...props} />;
}

export type ContextMenuShortcutProps = ContextMenuShortcutPrimitiveProps;

function ContextMenuShortcut({
  className,
  ...props
}: ContextMenuShortcutProps) {
  return (
    <ContextMenuShortcutPrimitive
      className={cn(contextMenuShortcutVariants(), className)}
      {...props}
    />
  );
}

export interface ContextMenuSubTriggerPrimitiveProps
  extends BaseUIContextMenu.SubmenuTrigger.Props {
  inset?: boolean;
}

function ContextMenuSubTriggerPrimitive({
  children,
  inset,
  ...props
}: ContextMenuSubTriggerPrimitiveProps) {
  return (
    <BaseUIContextMenu.SubmenuTrigger
      data-inset={inset}
      data-slot="context-menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto -me-0.5 opacity-80" />
    </BaseUIContextMenu.SubmenuTrigger>
  );
}

export type ContextMenuSubTriggerProps = ContextMenuSubTriggerPrimitiveProps;

function ContextMenuSubTrigger({
  className,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <ContextMenuSubTriggerPrimitive
      className={cn(contextMenuSubTriggerVariants(), className)}
      {...props}
    />
  );
}

export interface ContextMenuSubPopupProps
  extends BaseUIContextMenu.Popup.Props {
  align?: BaseUIContextMenu.Positioner.Props["align"];
  alignOffset?: BaseUIContextMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseUIContextMenu.Positioner.Props["sideOffset"];
}

function ContextMenuSubPopup({
  align = "start",
  alignOffset,
  sideOffset = 0,
  ...props
}: ContextMenuSubPopupProps) {
  const defaultAlignOffset = align !== "center" ? -5 : undefined;

  return (
    <ContextMenuPopup
      align={align}
      alignOffset={alignOffset ?? defaultAlignOffset}
      data-slot="context-menu-sub-content"
      side="inline-end"
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuCheckboxItemPrimitive,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuGroupLabelPrimitive,
  ContextMenuItem,
  ContextMenuItemPrimitive,
  ContextMenuLinkItem,
  ContextMenuLinkItemPrimitive,
  ContextMenuPopup,
  ContextMenuPopupPrimitive,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuRadioItemPrimitive,
  ContextMenuSeparator,
  ContextMenuSeparatorPrimitive,
  ContextMenuShortcut,
  ContextMenuShortcutPrimitive,
  ContextMenuSub,
  ContextMenuSubPopup,
  ContextMenuSubTrigger,
  ContextMenuSubTriggerPrimitive,
  ContextMenuTrigger,
  contextMenuCheckboxItemVariants,
  contextMenuGroupLabelVariants,
  contextMenuItemVariants,
  contextMenuPopupVariants,
  contextMenuRadioItemVariants,
  contextMenuSeparatorVariants,
  contextMenuShortcutVariants,
  contextMenuSubTriggerVariants,
};
