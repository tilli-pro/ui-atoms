import type * as React from "react";
import { Autocomplete as BaseUIAutocomplete } from "@base-ui/react/autocomplete";
import { cva } from "cva";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Input } from "../input/index.js";
import { ScrollArea } from "../scroll-area/index.js";

// coss base `.coss-base/autocomplete.tsx` @8163481, with the size ramp
// collapsed to its `sm:` member throughout. CBX-7/SCR-1: the base's
// `AutocompleteList` drives the scroll region through ScrollArea's
// `scrollFade` / `scrollbarGutter` / `overscrollContain` props, which is what
// our `className="flex-1"` call site was standing in for — taking the base is
// the fix.

const autocompleteInputGroupVariants = cva({
  base: "relative not-has-[>*.w-full]:w-fit w-full text-foreground has-disabled:opacity-64",
});

const autocompleteStartAddonVariants = cva({
  base: "pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5",
});

const autocompleteInputVariants = cva({
  base: "",
  defaultVariants: { size: "default", startAddon: false },
  variants: {
    size: {
      default:
        "has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-7",
      sm: "has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-6.5",
    },
    startAddon: {
      false: "",
      true: "data-[size=sm]:*:data-[slot=autocomplete-input]:ps-[calc(--spacing(7)-1px)] *:data-[slot=autocomplete-input]:ps-[calc(--spacing(8)-1px)]",
    },
  },
});

/** The trigger and the clear button share one class set in the base. */
const autocompleteAffordanceVariants = cva({
  base: "absolute top-1/2 inline-flex size-7 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-colors pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=autocomplete-clear]]:hidden [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  defaultVariants: { size: "default" },
  variants: { size: { default: "end-0.5", sm: "end-0" } },
});

const autocompletePopupFrameVariants = cva({
  base: "relative flex max-h-full min-w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const autocompleteItemVariants = cva({
  base: "flex min-h-7 cursor-default select-none items-center rounded-sm px-2 py-1 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64",
});

const autocompleteSeparatorVariants = cva({
  base: "mx-2 my-1 h-px bg-border last:hidden",
});

const autocompleteGroupVariants = cva({ base: "[[role=group]+&]:mt-1.5" });

const autocompleteGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
});

const autocompleteEmptyVariants = cva({
  base: "not-empty:p-2 text-center text-muted-foreground text-sm",
});

const autocompleteListVariants = cva({
  base: "not-empty:scroll-py-1 not-empty:p-1 in-data-has-overflow-y:pe-3",
});

const autocompleteClearVariants = cva({
  base: "absolute end-0.5 top-1/2 inline-flex size-7 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-[color,background-color,box-shadow,opacity] pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const autocompleteStatusVariants = cva({
  base: "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
});

const Autocomplete = BaseUIAutocomplete.Root;
const AutocompleteCollection = BaseUIAutocomplete.Collection;
const AutocompleteValue = BaseUIAutocomplete.Value;
const useAutocompleteFilter = BaseUIAutocomplete.useFilter;

export type AutocompleteTriggerProps = BaseUIAutocomplete.Trigger.Props;

function AutocompleteTrigger(props: AutocompleteTriggerProps) {
  return (
    <BaseUIAutocomplete.Trigger data-slot="autocomplete-trigger" {...props} />
  );
}

export type AutocompleteClearPrimitiveProps = BaseUIAutocomplete.Clear.Props;

function AutocompleteClearPrimitive({
  children,
  ...props
}: AutocompleteClearPrimitiveProps) {
  return (
    <BaseUIAutocomplete.Clear data-slot="autocomplete-clear" {...props}>
      {children ?? <XIcon />}
    </BaseUIAutocomplete.Clear>
  );
}

export type AutocompleteClearProps = AutocompleteClearPrimitiveProps;

function AutocompleteClear({ className, ...props }: AutocompleteClearProps) {
  return (
    <AutocompleteClearPrimitive
      className={cn(autocompleteClearVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteSize = "sm" | "default" | "lg" | number;

export interface AutocompleteInputPrimitiveProps
  extends Omit<BaseUIAutocomplete.Input.Props, "size"> {
  clearProps?: BaseUIAutocomplete.Clear.Props;
  ref?: React.Ref<HTMLInputElement>;
  showClear?: boolean;
  showTrigger?: boolean;
  size?: AutocompleteSize;
  startAddon?: React.ReactNode;
  triggerProps?: BaseUIAutocomplete.Trigger.Props;
}

interface AutocompleteInputPrimitiveInternalProps
  extends AutocompleteInputPrimitiveProps {
  /** Internal channels for the sub-part class sets. */
  affordanceClassName?: string;
  groupClassName?: string;
  startAddonClassName?: string;
}

/**
 * Input group + optional start addon + the trigger/clear affordances. The
 * caller's `className` lands on the Base UI Input, as in the base.
 */
function AutocompleteInputPrimitive({
  affordanceClassName,
  clearProps,
  groupClassName,
  showClear = false,
  showTrigger = false,
  size = "default",
  startAddon,
  startAddonClassName,
  triggerProps,
  ...props
}: AutocompleteInputPrimitiveInternalProps) {
  return (
    <BaseUIAutocomplete.InputGroup
      className={groupClassName}
      data-slot="autocomplete-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={startAddonClassName}
          data-slot="autocomplete-start-addon"
        >
          {startAddon}
        </div>
      )}
      <BaseUIAutocomplete.Input
        data-slot="autocomplete-input"
        render={<Input nativeInput={true} size={size} />}
        {...props}
      />
      {showTrigger && (
        <AutocompleteTrigger className={affordanceClassName} {...triggerProps}>
          <BaseUIAutocomplete.Icon data-slot="autocomplete-icon">
            <ChevronsUpDownIcon />
          </BaseUIAutocomplete.Icon>
        </AutocompleteTrigger>
      )}
      {showClear && (
        <AutocompleteClear className={affordanceClassName} {...clearProps} />
      )}
    </BaseUIAutocomplete.InputGroup>
  );
}

export type AutocompleteInputProps = AutocompleteInputPrimitiveProps;

function AutocompleteInput({
  className,
  size = "default",
  startAddon,
  ...props
}: AutocompleteInputProps) {
  const sizeVariant = size === "sm" ? "sm" : "default";

  return (
    <AutocompleteInputPrimitive
      affordanceClassName={autocompleteAffordanceVariants({
        size: sizeVariant,
      })}
      className={cn(
        autocompleteInputVariants({
          size: sizeVariant,
          startAddon: Boolean(startAddon),
        }),
        className,
      )}
      groupClassName={autocompleteInputGroupVariants()}
      size={size}
      startAddon={startAddon}
      startAddonClassName={autocompleteStartAddonVariants()}
      {...props}
    />
  );
}

export interface AutocompletePopupPrimitiveProps
  extends BaseUIAutocomplete.Popup.Props {
  align?: BaseUIAutocomplete.Positioner.Props["align"];
  alignOffset?: BaseUIAutocomplete.Positioner.Props["alignOffset"];
  anchor?: BaseUIAutocomplete.Positioner.Props["anchor"];
  portalProps?: BaseUIAutocomplete.Portal.Props;
  side?: BaseUIAutocomplete.Positioner.Props["side"];
  sideOffset?: BaseUIAutocomplete.Positioner.Props["sideOffset"];
}

interface AutocompletePopupPrimitiveInternalProps
  extends AutocompletePopupPrimitiveProps {
  /** Internal channel for the surrounding frame's class set; the base puts the
   *  caller's `className` on that `<span>`, not on the popup. */
  frameClassName?: string;
}

function AutocompletePopupPrimitive({
  align = "start",
  alignOffset,
  anchor,
  children,
  frameClassName,
  portalProps,
  side = "bottom",
  sideOffset = 4,
  ...props
}: AutocompletePopupPrimitiveInternalProps) {
  return (
    <BaseUIAutocomplete.Portal {...portalProps}>
      <BaseUIAutocomplete.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <span className={frameClassName}>
          <BaseUIAutocomplete.Popup
            className="flex max-h-[min(var(--available-height),23rem)] flex-1 flex-col text-foreground"
            data-slot="autocomplete-popup"
            {...props}
          >
            {children}
          </BaseUIAutocomplete.Popup>
        </span>
      </BaseUIAutocomplete.Positioner>
    </BaseUIAutocomplete.Portal>
  );
}

export type AutocompletePopupProps = AutocompletePopupPrimitiveProps;

function AutocompletePopup({ className, ...props }: AutocompletePopupProps) {
  return (
    <AutocompletePopupPrimitive
      frameClassName={cn(autocompletePopupFrameVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteItemPrimitiveProps = BaseUIAutocomplete.Item.Props;

function AutocompleteItemPrimitive(props: AutocompleteItemPrimitiveProps) {
  return <BaseUIAutocomplete.Item data-slot="autocomplete-item" {...props} />;
}

export type AutocompleteItemProps = AutocompleteItemPrimitiveProps;

function AutocompleteItem({ className, ...props }: AutocompleteItemProps) {
  return (
    <AutocompleteItemPrimitive
      className={cn(autocompleteItemVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteSeparatorPrimitiveProps =
  BaseUIAutocomplete.Separator.Props;

function AutocompleteSeparatorPrimitive(
  props: AutocompleteSeparatorPrimitiveProps,
) {
  return (
    <BaseUIAutocomplete.Separator
      data-slot="autocomplete-separator"
      {...props}
    />
  );
}

export type AutocompleteSeparatorProps = AutocompleteSeparatorPrimitiveProps;

function AutocompleteSeparator({
  className,
  ...props
}: AutocompleteSeparatorProps) {
  return (
    <AutocompleteSeparatorPrimitive
      className={cn(autocompleteSeparatorVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteGroupPrimitiveProps = BaseUIAutocomplete.Group.Props;

function AutocompleteGroupPrimitive(props: AutocompleteGroupPrimitiveProps) {
  return <BaseUIAutocomplete.Group data-slot="autocomplete-group" {...props} />;
}

export type AutocompleteGroupProps = AutocompleteGroupPrimitiveProps;

function AutocompleteGroup({ className, ...props }: AutocompleteGroupProps) {
  return (
    <AutocompleteGroupPrimitive
      className={cn(autocompleteGroupVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteGroupLabelPrimitiveProps =
  BaseUIAutocomplete.GroupLabel.Props;

function AutocompleteGroupLabelPrimitive(
  props: AutocompleteGroupLabelPrimitiveProps,
) {
  return (
    <BaseUIAutocomplete.GroupLabel
      data-slot="autocomplete-group-label"
      {...props}
    />
  );
}

export type AutocompleteGroupLabelProps = AutocompleteGroupLabelPrimitiveProps;

function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompleteGroupLabelProps) {
  return (
    <AutocompleteGroupLabelPrimitive
      className={cn(autocompleteGroupLabelVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteEmptyPrimitiveProps = BaseUIAutocomplete.Empty.Props;

function AutocompleteEmptyPrimitive(props: AutocompleteEmptyPrimitiveProps) {
  return <BaseUIAutocomplete.Empty data-slot="autocomplete-empty" {...props} />;
}

export type AutocompleteEmptyProps = AutocompleteEmptyPrimitiveProps;

function AutocompleteEmpty({ className, ...props }: AutocompleteEmptyProps) {
  return (
    <AutocompleteEmptyPrimitive
      className={cn(autocompleteEmptyVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteRowProps = BaseUIAutocomplete.Row.Props;

function AutocompleteRow(props: AutocompleteRowProps) {
  return <BaseUIAutocomplete.Row data-slot="autocomplete-row" {...props} />;
}

export type AutocompleteListPrimitiveProps = BaseUIAutocomplete.List.Props;

/** SCR-1/CBX-7: the scroll region is a `ScrollArea` with the base's flags. */
function AutocompleteListPrimitive(props: AutocompleteListPrimitiveProps) {
  return (
    <ScrollArea
      overscrollContain={true}
      scrollbarGutter={true}
      scrollFade={true}
    >
      <BaseUIAutocomplete.List data-slot="autocomplete-list" {...props} />
    </ScrollArea>
  );
}

export type AutocompleteListProps = AutocompleteListPrimitiveProps;

function AutocompleteList({ className, ...props }: AutocompleteListProps) {
  return (
    <AutocompleteListPrimitive
      className={cn(autocompleteListVariants(), className)}
      {...props}
    />
  );
}

export type AutocompleteStatusPrimitiveProps = BaseUIAutocomplete.Status.Props;

function AutocompleteStatusPrimitive(props: AutocompleteStatusPrimitiveProps) {
  return (
    <BaseUIAutocomplete.Status data-slot="autocomplete-status" {...props} />
  );
}

export type AutocompleteStatusProps = AutocompleteStatusPrimitiveProps;

function AutocompleteStatus({ className, ...props }: AutocompleteStatusProps) {
  return (
    <AutocompleteStatusPrimitive
      className={cn(autocompleteStatusVariants(), className)}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteClearPrimitive,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteEmptyPrimitive,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteGroupLabelPrimitive,
  AutocompleteGroupPrimitive,
  AutocompleteInput,
  AutocompleteInputPrimitive,
  AutocompleteItem,
  AutocompleteItemPrimitive,
  AutocompleteList,
  AutocompleteListPrimitive,
  AutocompletePopup,
  AutocompletePopupPrimitive,
  AutocompleteRow,
  AutocompleteSeparator,
  AutocompleteSeparatorPrimitive,
  AutocompleteStatus,
  AutocompleteStatusPrimitive,
  AutocompleteTrigger,
  AutocompleteValue,
  autocompleteAffordanceVariants,
  autocompleteClearVariants,
  autocompleteEmptyVariants,
  autocompleteGroupLabelVariants,
  autocompleteGroupVariants,
  autocompleteInputGroupVariants,
  autocompleteInputVariants,
  autocompleteItemVariants,
  autocompleteListVariants,
  autocompletePopupFrameVariants,
  autocompleteSeparatorVariants,
  autocompleteStartAddonVariants,
  autocompleteStatusVariants,
  useAutocompleteFilter,
};
