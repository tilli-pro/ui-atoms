import type * as React from "react";
import { Menu as BaseUIMenu } from "@base-ui/react/menu";
import { cva } from "cva";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "../../utils.js";

// coss base `.coss-base/menu.tsx` @8163481, with the size ramp collapsed to its
// `sm:` member throughout. The base supplies MNU-1 (`side`), MNU-2 (`className`
// lands on the Popup, not on a wrapper `<span>`), MNU-4 (the checkbox item's
// `variant`), MNU-5 (the `<kbd>` shortcut) and MNU-6 (`side="inline-end"` for
// submenus); MNU-3 (`MenuLinkItem`) is adopted here now that 1.8.0 makes
// `Menu.LinkItem` reachable.

const menuPopupVariants = cva({
  base: "relative flex not-[class*='w-']:min-w-32 origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus:outline-none dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const menuItemVariants = cva({
  base: "flex min-h-7 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-foreground text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-inset:ps-8 data-[variant=destructive]:text-destructive-foreground data-highlighted:text-accent-foreground data-disabled:opacity-64 [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0",
});

const menuCheckboxItemVariants = cva({
  base: "grid min-h-7 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default items-center gap-2 rounded-sm py-1 ps-2 text-foreground text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "grid-cols-[.75rem_1fr] pe-4",
      switch: "grid-cols-[1fr_auto] gap-4 pe-1.5",
    },
  },
});

const menuRadioItemVariants = cva({
  base: "grid min-h-7 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[.75rem_1fr] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-foreground text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const menuGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs data-inset:ps-8",
});

const menuSeparatorVariants = cva({ base: "mx-2 my-1 h-px bg-border" });

const menuShortcutVariants = cva({
  base: "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
});

const menuSubTriggerVariants = cva({
  base: "flex min-h-7 items-center gap-2 rounded-sm px-2 py-1 text-foreground text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-popup-open:bg-accent data-inset:ps-8 data-highlighted:text-accent-foreground data-popup-open:text-accent-foreground data-disabled:opacity-64 [&>svg:not(:last-child)]:-mx-0.5 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
});

const MenuCreateHandle = BaseUIMenu.createHandle;
const Menu = BaseUIMenu.Root;
const MenuPortal = BaseUIMenu.Portal;

export type MenuTriggerProps = BaseUIMenu.Trigger.Props;

function MenuTrigger(props: MenuTriggerProps) {
  return <BaseUIMenu.Trigger data-slot="menu-trigger" {...props} />;
}

export type MenuGroupProps = BaseUIMenu.Group.Props;

function MenuGroup(props: MenuGroupProps) {
  return <BaseUIMenu.Group data-slot="menu-group" {...props} />;
}

export type MenuRadioGroupProps = BaseUIMenu.RadioGroup.Props;

function MenuRadioGroup(props: MenuRadioGroupProps) {
  return <BaseUIMenu.RadioGroup data-slot="menu-radio-group" {...props} />;
}

export type MenuSubProps = BaseUIMenu.SubmenuRoot.Props;

function MenuSub(props: MenuSubProps) {
  return <BaseUIMenu.SubmenuRoot data-slot="menu-sub" {...props} />;
}

export interface MenuPopupPrimitiveProps extends BaseUIMenu.Popup.Props {
  align?: BaseUIMenu.Positioner.Props["align"];
  alignOffset?: BaseUIMenu.Positioner.Props["alignOffset"];
  anchor?: BaseUIMenu.Positioner.Props["anchor"];
  portalProps?: BaseUIMenu.Portal.Props;
  side?: BaseUIMenu.Positioner.Props["side"];
  sideOffset?: BaseUIMenu.Positioner.Props["sideOffset"];
}

/** Portal + positioner + popup + the scrolling inner pane. */
function MenuPopupPrimitive({
  align = "center",
  alignOffset,
  anchor,
  children,
  portalProps,
  side = "bottom",
  sideOffset = 4,
  ...props
}: MenuPopupPrimitiveProps) {
  return (
    <MenuPortal {...portalProps}>
      <BaseUIMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50"
        data-slot="menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseUIMenu.Popup data-slot="menu-popup" {...props}>
          <div className="max-h-(--available-height) w-full overflow-y-auto p-1">
            {children}
          </div>
        </BaseUIMenu.Popup>
      </BaseUIMenu.Positioner>
    </MenuPortal>
  );
}

export type MenuPopupProps = MenuPopupPrimitiveProps;

function MenuPopup({ className, ...props }: MenuPopupProps) {
  return (
    <MenuPopupPrimitive
      className={cn(menuPopupVariants(), className)}
      {...props}
    />
  );
}

export interface MenuItemPrimitiveProps extends BaseUIMenu.Item.Props {
  inset?: boolean;
  variant?: "default" | "destructive";
}

function MenuItemPrimitive({
  inset,
  variant = "default",
  ...props
}: MenuItemPrimitiveProps) {
  return (
    <BaseUIMenu.Item
      data-inset={inset}
      data-slot="menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

export type MenuItemProps = MenuItemPrimitiveProps;

function MenuItem({ className, ...props }: MenuItemProps) {
  return (
    <MenuItemPrimitive
      className={cn(menuItemVariants(), className)}
      {...props}
    />
  );
}

export interface MenuLinkItemPrimitiveProps extends BaseUIMenu.LinkItem.Props {
  inset?: boolean;
  variant?: "default" | "destructive";
}

/** MNU-3: a real `<a>` inside the popup, keyboard-reachable like any item. */
function MenuLinkItemPrimitive({
  closeOnClick = true,
  inset,
  variant = "default",
  ...props
}: MenuLinkItemPrimitiveProps) {
  return (
    <BaseUIMenu.LinkItem
      closeOnClick={closeOnClick}
      data-inset={inset}
      data-slot="menu-link-item"
      data-variant={variant}
      {...props}
    />
  );
}

export type MenuLinkItemProps = MenuLinkItemPrimitiveProps;

function MenuLinkItem({ className, ...props }: MenuLinkItemProps) {
  return (
    <MenuLinkItemPrimitive
      className={cn(menuItemVariants(), className)}
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

export interface MenuCheckboxItemPrimitiveProps
  extends BaseUIMenu.CheckboxItem.Props {
  /** MNU-4: `switch` swaps the tick for a switch-shaped indicator. */
  variant?: "default" | "switch";
}

function MenuCheckboxItemPrimitive({
  children,
  variant = "default",
  ...props
}: MenuCheckboxItemPrimitiveProps) {
  return (
    <BaseUIMenu.CheckboxItem data-slot="menu-checkbox-item" {...props}>
      {variant === "switch" ? (
        <>
          <span className="col-start-1">{children}</span>
          <BaseUIMenu.CheckboxItemIndicator
            className="inset-shadow-[0_1px_--theme(--color-black/4%)] inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:--spacing(3)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64"
            keepMounted={true}
          >
            <span className="pointer-events-none block aspect-square h-full in-[[data-slot=menu-checkbox-item][data-checked]]:origin-[var(--thumb-size)_50%] origin-left in-[[data-slot=menu-checkbox-item][data-checked]]:translate-x-[calc(var(--thumb-size)-4px)] in-[[data-slot=menu-checkbox-item]:active]:not-data-disabled:scale-x-110 in-[[data-slot=menu-checkbox-item]:active]:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.10)] rounded-(--thumb-size) bg-background shadow-sm/5 will-change-transform [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]" />
          </BaseUIMenu.CheckboxItemIndicator>
        </>
      ) : (
        <>
          <BaseUIMenu.CheckboxItemIndicator className="col-start-1 -ms-0.5">
            <CheckPath />
          </BaseUIMenu.CheckboxItemIndicator>
          <span className="col-start-2">{children}</span>
        </>
      )}
    </BaseUIMenu.CheckboxItem>
  );
}

export type MenuCheckboxItemProps = MenuCheckboxItemPrimitiveProps;

function MenuCheckboxItem({
  className,
  variant = "default",
  ...props
}: MenuCheckboxItemProps) {
  return (
    <MenuCheckboxItemPrimitive
      className={cn(menuCheckboxItemVariants({ variant }), className)}
      variant={variant}
      {...props}
    />
  );
}

export type MenuRadioItemPrimitiveProps = BaseUIMenu.RadioItem.Props;

function MenuRadioItemPrimitive({
  children,
  ...props
}: MenuRadioItemPrimitiveProps) {
  return (
    <BaseUIMenu.RadioItem data-slot="menu-radio-item" {...props}>
      <BaseUIMenu.RadioItemIndicator className="col-start-1 -ms-0.5">
        <CheckPath />
      </BaseUIMenu.RadioItemIndicator>
      <span className="col-start-2">{children}</span>
    </BaseUIMenu.RadioItem>
  );
}

export type MenuRadioItemProps = MenuRadioItemPrimitiveProps;

function MenuRadioItem({ className, ...props }: MenuRadioItemProps) {
  return (
    <MenuRadioItemPrimitive
      className={cn(menuRadioItemVariants(), className)}
      {...props}
    />
  );
}

export interface MenuGroupLabelPrimitiveProps
  extends BaseUIMenu.GroupLabel.Props {
  inset?: boolean;
}

function MenuGroupLabelPrimitive({
  inset,
  ...props
}: MenuGroupLabelPrimitiveProps) {
  return (
    <BaseUIMenu.GroupLabel
      data-inset={inset}
      data-slot="menu-label"
      {...props}
    />
  );
}

export type MenuGroupLabelProps = MenuGroupLabelPrimitiveProps;

function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return (
    <MenuGroupLabelPrimitive
      className={cn(menuGroupLabelVariants(), className)}
      {...props}
    />
  );
}

export type MenuSeparatorPrimitiveProps = BaseUIMenu.Separator.Props;

function MenuSeparatorPrimitive(props: MenuSeparatorPrimitiveProps) {
  return <BaseUIMenu.Separator data-slot="menu-separator" {...props} />;
}

export type MenuSeparatorProps = MenuSeparatorPrimitiveProps;

function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
  return (
    <MenuSeparatorPrimitive
      className={cn(menuSeparatorVariants(), className)}
      {...props}
    />
  );
}

export type MenuShortcutPrimitiveProps = React.ComponentProps<"kbd">;

function MenuShortcutPrimitive(props: MenuShortcutPrimitiveProps) {
  return <kbd data-slot="menu-shortcut" {...props} />;
}

export type MenuShortcutProps = MenuShortcutPrimitiveProps;

function MenuShortcut({ className, ...props }: MenuShortcutProps) {
  return (
    <MenuShortcutPrimitive
      className={cn(menuShortcutVariants(), className)}
      {...props}
    />
  );
}

export interface MenuSubTriggerPrimitiveProps
  extends BaseUIMenu.SubmenuTrigger.Props {
  inset?: boolean;
}

function MenuSubTriggerPrimitive({
  children,
  inset,
  ...props
}: MenuSubTriggerPrimitiveProps) {
  return (
    <BaseUIMenu.SubmenuTrigger
      data-inset={inset}
      data-slot="menu-sub-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto -me-0.5 opacity-80" />
    </BaseUIMenu.SubmenuTrigger>
  );
}

export type MenuSubTriggerProps = MenuSubTriggerPrimitiveProps;

function MenuSubTrigger({ className, ...props }: MenuSubTriggerProps) {
  return (
    <MenuSubTriggerPrimitive
      className={cn(menuSubTriggerVariants(), className)}
      {...props}
    />
  );
}

export interface MenuSubPopupProps extends BaseUIMenu.Popup.Props {
  align?: BaseUIMenu.Positioner.Props["align"];
  alignOffset?: BaseUIMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseUIMenu.Positioner.Props["sideOffset"];
}

/** MNU-6: `side="inline-end"` opens the submenu beside its trigger. */
function MenuSubPopup({
  align = "start",
  alignOffset,
  sideOffset = 0,
  ...props
}: MenuSubPopupProps) {
  const defaultAlignOffset = align !== "center" ? -5 : undefined;

  return (
    <MenuPopup
      align={align}
      alignOffset={alignOffset ?? defaultAlignOffset}
      data-slot="menu-sub-content"
      side="inline-end"
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export {
  Menu,
  MenuCheckboxItem,
  MenuCheckboxItemPrimitive,
  MenuCreateHandle,
  MenuGroup,
  MenuGroupLabel,
  MenuGroupLabelPrimitive,
  MenuItem,
  MenuItemPrimitive,
  MenuLinkItem,
  MenuLinkItemPrimitive,
  MenuPopup,
  MenuPopupPrimitive,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRadioItemPrimitive,
  MenuSeparator,
  MenuSeparatorPrimitive,
  MenuShortcut,
  MenuShortcutPrimitive,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuSubTriggerPrimitive,
  MenuTrigger,
  menuCheckboxItemVariants,
  menuGroupLabelVariants,
  menuItemVariants,
  menuPopupVariants,
  menuRadioItemVariants,
  menuSeparatorVariants,
  menuShortcutVariants,
  menuSubTriggerVariants,
};
