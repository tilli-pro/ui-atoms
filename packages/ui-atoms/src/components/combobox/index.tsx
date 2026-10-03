"use client";

import * as React from "react";
import { Combobox as BaseUICombobox } from "@base-ui/react/combobox";
import { cva } from "cva";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Input } from "../input/index.js";
import { ScrollArea } from "../scroll-area/index.js";

// coss base `.coss-base/combobox.tsx` @8163481, with the size ramp collapsed to
// its `sm:` member throughout. CBX-7/SCR-1: the base's `ComboboxList` drives
// the scroll region through ScrollArea's `scrollFade` / `scrollbarGutter` /
// `overscrollContain` props, which is what our `className="flex-1"` call site
// was standing in for — taking the base is the fix. MSL-1: `<Combobox multiple>`
// replaces the deleted `multi-select`.

const comboboxChipsInputVariants = cva({
  base: "min-w-12 flex-1 text-foreground text-sm outline-none [[data-slot=combobox-chip]+&]:ps-0.5",
  defaultVariants: { size: "default" },
  variants: { size: { default: "ps-2", sm: "ps-1.5" } },
});

const comboboxInputGroupVariants = cva({
  base: "relative not-has-[>*.w-full]:w-fit w-full text-foreground has-disabled:opacity-64",
});

const comboboxStartAddonVariants = cva({
  base: "pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5",
});

const comboboxInputVariants = cva({
  base: "",
  defaultVariants: { size: "default", startAddon: false },
  variants: {
    size: {
      default:
        "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-7",
      sm: "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-6.5",
    },
    startAddon: {
      false: "",
      true: "data-[size=sm]:*:data-[slot=combobox-input]:ps-[calc(--spacing(7)-1px)] *:data-[slot=combobox-input]:ps-[calc(--spacing(8)-1px)]",
    },
  },
});

/** The trigger and the clear button share one class set in the base. */
const comboboxAffordanceVariants = cva({
  base: "absolute top-1/2 inline-flex size-7 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=combobox-clear]]:hidden [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  defaultVariants: { size: "default" },
  variants: { size: { default: "end-0.5", sm: "end-0" } },
});

const comboboxPopupFrameVariants = cva({
  base: "relative flex max-h-full min-w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const comboboxItemVariants = cva({
  base: "grid min-h-7 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const comboboxSeparatorVariants = cva({
  base: "mx-2 my-1 h-px bg-border last:hidden",
});

const comboboxGroupVariants = cva({ base: "[[role=group]+&]:mt-1.5" });

const comboboxGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
});

const comboboxEmptyVariants = cva({
  base: "not-empty:p-2 text-center text-muted-foreground text-sm",
});

const comboboxListVariants = cva({
  base: "not-empty:scroll-py-1 not-empty:px-1 not-empty:py-1 in-data-has-overflow-y:pe-3",
});

const comboboxStatusVariants = cva({
  base: "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
});

const comboboxChipsVariants = cva({
  base: "relative inline-flex min-h-8 w-full flex-wrap gap-1 rounded-lg border border-input bg-background not-dark:bg-clip-padding p-[calc(--spacing(1)-1px)] text-sm shadow-xs/5 outline-none ring-ring/24 transition-shadow *:min-h-6 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] focus-within:border-ring focus-within:ring-[3px] has-disabled:pointer-events-none has-data-[size=lg]:min-h-9 has-data-[size=sm]:min-h-7 has-aria-invalid:border-destructive/36 has-disabled:opacity-64 has-[:disabled,:focus-within,[aria-invalid]]:shadow-none focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 has-data-[size=lg]:*:min-h-7 has-data-[size=sm]:*:min-h-5 dark:not-has-disabled:bg-input/32 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-focus-within:not-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const comboboxChipsStartAddonVariants = cva({
  base: "flex shrink-0 items-center ps-2 opacity-80 has-[~[data-size=sm]]:has-[+[data-slot=combobox-chip]]:pe-1.5 has-[~[data-size=sm]]:ps-1.5 has-[+[data-slot=combobox-chip]]:pe-2 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-ms-0.5 [&_svg]:-me-1.5",
});

const comboboxChipVariants = cva({
  base: "flex items-center rounded-[calc(var(--radius-md)-1px)] bg-accent ps-2 font-medium text-accent-foreground text-xs/(--text-xs--line-height) outline-none [&_svg:not([class*='size-'])]:size-3.5",
});

const comboboxChipRemoveVariants = cva({
  base: "h-full shrink-0 cursor-pointer px-1.5 opacity-80 hover:opacity-100 [&_svg:not([class*='size-'])]:size-3.5",
});

/** The chips element doubles as the popup's anchor when `multiple` is on. */
const ComboboxContext = React.createContext<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}>({ chipsRef: null, multiple: false });

const ComboboxCollection = BaseUICombobox.Collection;
const ComboboxValue = BaseUICombobox.Value;
const createComboboxItems = BaseUICombobox.createItems;
const useComboboxFilter = BaseUICombobox.useFilter;

function Combobox<
  Value,
  Multiple extends boolean | undefined = false,
  Item = Value,
>(props: BaseUICombobox.Root.Props<Value, Multiple, Item>) {
  const chipsRef = React.useRef<Element | null>(null);

  return (
    <ComboboxContext.Provider value={{ chipsRef, multiple: !!props.multiple }}>
      <BaseUICombobox.Root {...props} />
    </ComboboxContext.Provider>
  );
}

export type ComboboxTriggerProps = BaseUICombobox.Trigger.Props;

// a11y: the trigger is icon-only (a chevron, `aria-hidden`) with no
// text of its own — axe's `button-name` check on `<button>` correctly flags
// it. Default `aria-label`, overridable by the caller like any other prop.
function ComboboxTrigger({
  "aria-label": ariaLabel = "Toggle options",
  ...props
}: ComboboxTriggerProps) {
  return (
    <BaseUICombobox.Trigger
      aria-label={ariaLabel}
      data-slot="combobox-trigger"
      {...props}
    />
  );
}

export type ComboboxClearProps = BaseUICombobox.Clear.Props;

function ComboboxClear(props: ComboboxClearProps) {
  return <BaseUICombobox.Clear data-slot="combobox-clear" {...props} />;
}

export type ComboboxSize = "sm" | "default" | "lg" | number;

export interface ComboboxChipsInputPrimitiveProps
  extends Omit<BaseUICombobox.Input.Props, "size"> {
  ref?: React.Ref<HTMLInputElement>;
  size?: ComboboxSize;
}

function ComboboxChipsInputPrimitive({
  size = "default",
  ...props
}: ComboboxChipsInputPrimitiveProps) {
  return (
    <BaseUICombobox.Input
      data-size={typeof size === "string" ? size : undefined}
      data-slot="combobox-chips-input"
      size={typeof size === "number" ? size : undefined}
      {...props}
    />
  );
}

export type ComboboxChipsInputProps = ComboboxChipsInputPrimitiveProps;

function ComboboxChipsInput({
  className,
  size = "default",
  ...props
}: ComboboxChipsInputProps) {
  return (
    <ComboboxChipsInputPrimitive
      className={cn(
        comboboxChipsInputVariants({ size: size === "sm" ? "sm" : "default" }),
        className,
      )}
      size={size}
      {...props}
    />
  );
}

export interface ComboboxInputPrimitiveProps
  extends Omit<BaseUICombobox.Input.Props, "size"> {
  clearProps?: BaseUICombobox.Clear.Props;
  ref?: React.Ref<HTMLInputElement>;
  showClear?: boolean;
  showTrigger?: boolean;
  size?: ComboboxSize;
  startAddon?: React.ReactNode;
  triggerProps?: BaseUICombobox.Trigger.Props;
}

interface ComboboxInputPrimitiveInternalProps
  extends ComboboxInputPrimitiveProps {
  /** Internal channels for the sub-part class sets. */
  affordanceClassName?: string;
  groupClassName?: string;
  startAddonClassName?: string;
}

function ComboboxInputPrimitive({
  affordanceClassName,
  clearProps,
  groupClassName,
  showClear = false,
  showTrigger = true,
  size = "default",
  startAddon,
  startAddonClassName,
  triggerProps,
  ...props
}: ComboboxInputPrimitiveInternalProps) {
  return (
    <BaseUICombobox.InputGroup
      className={groupClassName}
      data-slot="combobox-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={startAddonClassName}
          data-slot="combobox-start-addon"
        >
          {startAddon}
        </div>
      )}
      <BaseUICombobox.Input
        data-slot="combobox-input"
        render={
          <Input
            className="has-disabled:opacity-100"
            nativeInput={true}
            size={size}
          />
        }
        {...props}
      />
      {showTrigger && (
        <ComboboxTrigger className={affordanceClassName} {...triggerProps}>
          <BaseUICombobox.Icon data-slot="combobox-icon">
            <ChevronsUpDownIcon />
          </BaseUICombobox.Icon>
        </ComboboxTrigger>
      )}
      {showClear && (
        <ComboboxClear className={affordanceClassName} {...clearProps}>
          <XIcon />
        </ComboboxClear>
      )}
    </BaseUICombobox.InputGroup>
  );
}

export type ComboboxInputProps = ComboboxInputPrimitiveProps;

function ComboboxInput({
  className,
  size = "default",
  startAddon,
  ...props
}: ComboboxInputProps) {
  const sizeVariant = size === "sm" ? "sm" : "default";

  return (
    <ComboboxInputPrimitive
      affordanceClassName={comboboxAffordanceVariants({ size: sizeVariant })}
      className={cn(
        comboboxInputVariants({
          size: sizeVariant,
          startAddon: Boolean(startAddon),
        }),
        className,
      )}
      groupClassName={comboboxInputGroupVariants()}
      size={size}
      startAddon={startAddon}
      startAddonClassName={comboboxStartAddonVariants()}
      {...props}
    />
  );
}

export interface ComboboxPopupPrimitiveProps
  extends BaseUICombobox.Popup.Props {
  align?: BaseUICombobox.Positioner.Props["align"];
  alignOffset?: BaseUICombobox.Positioner.Props["alignOffset"];
  anchor?: BaseUICombobox.Positioner.Props["anchor"];
  portalProps?: BaseUICombobox.Portal.Props;
  side?: BaseUICombobox.Positioner.Props["side"];
  sideOffset?: BaseUICombobox.Positioner.Props["sideOffset"];
}

interface ComboboxPopupPrimitiveInternalProps
  extends ComboboxPopupPrimitiveProps {
  /** Internal channel for the surrounding frame's class set; the base puts the
   *  caller's `className` on that `<span>`, not on the popup. */
  frameClassName?: string;
}

function ComboboxPopupPrimitive({
  align = "start",
  alignOffset,
  anchor: anchorProp,
  children,
  frameClassName,
  portalProps,
  side = "bottom",
  sideOffset = 4,
  ...props
}: ComboboxPopupPrimitiveInternalProps) {
  const { chipsRef } = React.useContext(ComboboxContext);
  const anchor = anchorProp ?? chipsRef;

  return (
    <BaseUICombobox.Portal {...portalProps}>
      <BaseUICombobox.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="combobox-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <span className={frameClassName}>
          <BaseUICombobox.Popup
            className="flex max-h-[min(var(--available-height),23rem)] flex-1 flex-col text-foreground"
            data-slot="combobox-popup"
            {...props}
          >
            {children}
          </BaseUICombobox.Popup>
        </span>
      </BaseUICombobox.Positioner>
    </BaseUICombobox.Portal>
  );
}

export type ComboboxPopupProps = ComboboxPopupPrimitiveProps;

function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
  return (
    <ComboboxPopupPrimitive
      frameClassName={cn(comboboxPopupFrameVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxItemPrimitiveProps = BaseUICombobox.Item.Props;

function ComboboxItemPrimitive({
  children,
  ...props
}: ComboboxItemPrimitiveProps) {
  return (
    <BaseUICombobox.Item data-slot="combobox-item" {...props}>
      <BaseUICombobox.ItemIndicator className="col-start-1">
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
      </BaseUICombobox.ItemIndicator>
      <div className="wrap-anywhere col-start-2 min-w-0">{children}</div>
    </BaseUICombobox.Item>
  );
}

export type ComboboxItemProps = ComboboxItemPrimitiveProps;

function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  return (
    <ComboboxItemPrimitive
      className={cn(comboboxItemVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxSeparatorPrimitiveProps = BaseUICombobox.Separator.Props;

function ComboboxSeparatorPrimitive(props: ComboboxSeparatorPrimitiveProps) {
  return <BaseUICombobox.Separator data-slot="combobox-separator" {...props} />;
}

export type ComboboxSeparatorProps = ComboboxSeparatorPrimitiveProps;

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <ComboboxSeparatorPrimitive
      className={cn(comboboxSeparatorVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxGroupPrimitiveProps = BaseUICombobox.Group.Props;

function ComboboxGroupPrimitive(props: ComboboxGroupPrimitiveProps) {
  return <BaseUICombobox.Group data-slot="combobox-group" {...props} />;
}

export type ComboboxGroupProps = ComboboxGroupPrimitiveProps;

function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return (
    <ComboboxGroupPrimitive
      className={cn(comboboxGroupVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxGroupLabelPrimitiveProps = BaseUICombobox.GroupLabel.Props;

function ComboboxGroupLabelPrimitive(props: ComboboxGroupLabelPrimitiveProps) {
  return (
    <BaseUICombobox.GroupLabel data-slot="combobox-group-label" {...props} />
  );
}

export type ComboboxGroupLabelProps = ComboboxGroupLabelPrimitiveProps;

function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return (
    <ComboboxGroupLabelPrimitive
      className={cn(comboboxGroupLabelVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxEmptyPrimitiveProps = BaseUICombobox.Empty.Props;

function ComboboxEmptyPrimitive(props: ComboboxEmptyPrimitiveProps) {
  return <BaseUICombobox.Empty data-slot="combobox-empty" {...props} />;
}

export type ComboboxEmptyProps = ComboboxEmptyPrimitiveProps;

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxEmptyPrimitive
      className={cn(comboboxEmptyVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxRowProps = BaseUICombobox.Row.Props;

function ComboboxRow(props: ComboboxRowProps) {
  return <BaseUICombobox.Row data-slot="combobox-row" {...props} />;
}

export type ComboboxListPrimitiveProps = BaseUICombobox.List.Props;

/** SCR-1/CBX-7: the scroll region is a `ScrollArea` with the base's flags. */
function ComboboxListPrimitive(props: ComboboxListPrimitiveProps) {
  return (
    <ScrollArea
      overscrollContain={true}
      scrollbarGutter={true}
      scrollFade={true}
    >
      <BaseUICombobox.List data-slot="combobox-list" {...props} />
    </ScrollArea>
  );
}

export type ComboboxListProps = ComboboxListPrimitiveProps;

function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ComboboxListPrimitive
      className={cn(comboboxListVariants(), className)}
      {...props}
    />
  );
}

export type ComboboxStatusPrimitiveProps = BaseUICombobox.Status.Props;

function ComboboxStatusPrimitive(props: ComboboxStatusPrimitiveProps) {
  return <BaseUICombobox.Status data-slot="combobox-status" {...props} />;
}

export type ComboboxStatusProps = ComboboxStatusPrimitiveProps;

function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
  return (
    <ComboboxStatusPrimitive
      className={cn(comboboxStatusVariants(), className)}
      {...props}
    />
  );
}

export interface ComboboxChipsPrimitiveProps
  extends BaseUICombobox.Chips.Props {
  startAddon?: React.ReactNode;
}

interface ComboboxChipsPrimitiveInternalProps
  extends ComboboxChipsPrimitiveProps {
  /** Internal channel for the start addon's class set. */
  startAddonClassName?: string;
}

function ComboboxChipsPrimitive({
  children,
  startAddon,
  startAddonClassName,
  ...props
}: ComboboxChipsPrimitiveInternalProps) {
  const { chipsRef } = React.useContext(ComboboxContext);

  return (
    <BaseUICombobox.Chips
      data-slot="combobox-chips"
      ref={chipsRef as React.Ref<HTMLDivElement> | null}
      {...props}
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={startAddonClassName}
          data-slot="combobox-start-addon"
        >
          {startAddon}
        </div>
      )}
      {children}
    </BaseUICombobox.Chips>
  );
}

export type ComboboxChipsProps = ComboboxChipsPrimitiveProps;

function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  return (
    <ComboboxChipsPrimitive
      className={cn(comboboxChipsVariants(), className)}
      startAddonClassName={comboboxChipsStartAddonVariants()}
      {...props}
    />
  );
}

export type ComboboxChipRemoveProps = BaseUICombobox.ChipRemove.Props;

function ComboboxChipRemove({ className, ...props }: ComboboxChipRemoveProps) {
  return (
    <BaseUICombobox.ChipRemove
      aria-label="Remove"
      className={cn(comboboxChipRemoveVariants(), className)}
      data-slot="combobox-chip-remove"
      {...props}
    >
      <XIcon />
    </BaseUICombobox.ChipRemove>
  );
}

export interface ComboboxChipPrimitiveProps extends BaseUICombobox.Chip.Props {
  removeProps?: BaseUICombobox.ChipRemove.Props;
}

function ComboboxChipPrimitive({
  children,
  removeProps,
  ...props
}: ComboboxChipPrimitiveProps) {
  return (
    <BaseUICombobox.Chip data-slot="combobox-chip" {...props}>
      {children}
      <ComboboxChipRemove {...removeProps} />
    </BaseUICombobox.Chip>
  );
}

export type ComboboxChipProps = ComboboxChipPrimitiveProps;

function ComboboxChip({ className, ...props }: ComboboxChipProps) {
  return (
    <ComboboxChipPrimitive
      className={cn(comboboxChipVariants(), className)}
      {...props}
    />
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChipPrimitive,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxChipsInputPrimitive,
  ComboboxChipsPrimitive,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContext,
  ComboboxEmpty,
  ComboboxEmptyPrimitive,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxGroupLabelPrimitive,
  ComboboxGroupPrimitive,
  ComboboxInput,
  ComboboxInputPrimitive,
  ComboboxItem,
  ComboboxItemPrimitive,
  ComboboxList,
  ComboboxListPrimitive,
  ComboboxPopup,
  ComboboxPopupPrimitive,
  ComboboxRow,
  ComboboxSeparator,
  ComboboxSeparatorPrimitive,
  ComboboxStatus,
  ComboboxStatusPrimitive,
  ComboboxTrigger,
  ComboboxValue,
  comboboxAffordanceVariants,
  comboboxChipRemoveVariants,
  comboboxChipsInputVariants,
  comboboxChipsStartAddonVariants,
  comboboxChipsVariants,
  comboboxChipVariants,
  comboboxEmptyVariants,
  comboboxGroupLabelVariants,
  comboboxGroupVariants,
  comboboxInputGroupVariants,
  comboboxInputVariants,
  comboboxItemVariants,
  comboboxListVariants,
  comboboxPopupFrameVariants,
  comboboxSeparatorVariants,
  comboboxStartAddonVariants,
  comboboxStatusVariants,
  createComboboxItems,
  useComboboxFilter,
};
