"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { Select as BaseUISelect } from "@base-ui/react/select";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "cva";
import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { cn } from "../../utils.js";

// Every part below is the same styled/primitive/variants triple over the coss base: an unstyled
// `<Part>Primitive` that carries the `data-slot`, the structure and the
// behaviour, the base's class string as `select<Part>Variants`, and the styled
// `<Part>`. Class strings are the base's with the responsive size ramp
// collapsed to its `sm:` member (`min-h-9 … sm:min-h-8` → `min-h-8`,
// `text-base … sm:text-sm` → `text-sm`, `size-4.5 … sm:size-4` → `size-4`).

const Select = BaseUISelect.Root;

const selectTriggerVariants = cva({
  base: "relative inline-flex min-h-8 w-full min-w-36 select-none items-center justify-between gap-2 rounded-lg border border-input bg-background not-dark:bg-clip-padding px-[calc(--spacing(3)-1px)] text-left text-sm text-foreground shadow-xs/5 outline-none ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 focus-visible:border-ring focus-visible:ring-[3px] aria-invalid:border-destructive/36 focus-visible:aria-invalid:border-destructive/64 focus-visible:aria-invalid:ring-destructive/16 data-disabled:pointer-events-none data-disabled:opacity-64 dark:bg-input/32 dark:aria-invalid:ring-destructive/24 dark:not-data-disabled:not-focus-visible:not-aria-invalid:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [[data-disabled],:focus-visible,[aria-invalid],[data-pressed]]:shadow-none",
  variants: {
    size: {
      default: "",
      lg: "min-h-9",
      sm: "min-h-7 gap-1.5 px-[calc(--spacing(2.5)-1px)]",
    },
  },
  defaultVariants: { size: "default" },
});

/** Exported as a plain string, as in the base: `input-group` and `combobox`
 *  both put the same chevron on a control that is not a select trigger. */
const selectTriggerIconClassName = "-me-1 size-4 opacity-80";

export interface SelectButtonProps extends useRender.ComponentProps<"button"> {
  size?: VariantProps<typeof selectTriggerVariants>["size"];
}

/** SEL-2: a trigger-looking button for callers that drive the select
 *  themselves. It is styled by definition, so it has no primitive of its own. */
function SelectButton({
  className,
  size,
  render,
  children,
  ...props
}: SelectButtonProps) {
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const defaultProps = {
    children: (
      <>
        <span className="flex-1 truncate in-data-placeholder:text-muted-foreground/72">
          {children}
        </span>
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </>
    ),
    className: cn(selectTriggerVariants({ size }), "min-w-0", className),
    "data-slot": "select-button",
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

export type SelectTriggerPrimitiveProps = BaseUISelect.Trigger.Props;

/**
 * a11y: `role="combobox"` (set by `BaseUISelect.Trigger`
 * itself) has `nameFrom: author` per the ARIA spec — axe's `button-name`
 * check does NOT credit the trigger's own visible text content as an
 * accessible name for that role, even though a sighted user sees the
 * placeholder/selected value. `SelectValueIdContext` lets
 * `SelectValuePrimitive` claim the id the trigger generates, so the trigger
 * can point `aria-labelledby` at its own child without the caller doing
 * anything extra — but only as a *fallback*: base-ui's own `SelectTrigger`
 * already computes `aria-labelledby` from `resolveAriaLabelledBy(fieldLabelId,
 * selectLabelId)` (a `Field`'s `FieldLabel`, or a Select's `Label`), and that
 * context (`FieldRootContext`/`SelectRootContext`) is internal — not part of
 * `@base-ui/react`'s public API, so it cannot be read from here directly.
 * Setting `aria-labelledby` unconditionally as a static prop would silently
 * win regardless: `mergeProps` inside base-ui's `SelectTrigger` merges the
 * props this component spreads down (`elementProps`) *after* its own
 * computed `aria-labelledby`, and always overwrites — undefined included.
 *
 * a11y (SSR): the naive read of the above is "so decide with an
 * effect" — but an effect (or even `useLayoutEffect`) never runs during SSR,
 * so a `"use client"` component rendered by a framework that still
 * server-renders it (Next.js and friends do, by default) would ship this
 * fallback path's whole point — the trigger's *only* accessible name — as
 * completely absent from the server-rendered/pre-hydration HTML. Fixed by
 * seeding a piece of state to `true` — matching, deterministically, on both
 * the server render and the client's first (hydrating) render, so there is
 * no hydration mismatch — that *does* render the fallback `aria-labelledby`
 * as an ordinary synchronous prop for exactly that first render. This is
 * safe to do unconditionally (never a guess): base-ui's own real-label
 * registration (`FieldLabel`/Select's `Label`, both via `useIsoLayoutEffect`
 * inside `@base-ui/react`'s `useRegisteredLabelId`) is *itself* only ever
 * populated by an effect, so on that very first render — server or client —
 * base-ui has never yet computed a real `aria-labelledby` either; there is
 * nothing for this fallback to clobber at that moment, for any composition.
 * A `useEffect` right after mount then flips that state to `false` once,
 * which drops the prop from this component's own output entirely — by then
 * base-ui's layout effects (which run before any passive effect in the same
 * commit) have already resolved a real label if one exists, so the very
 * next render reads its true computed value straight from base-ui, not a
 * stale guess. From that point on the same per-render effect this
 * component carries throughout takes back over: if base-ui still has
 * not set anything (no real label ever existed), it sets the attribute
 * directly on the DOM node — never as a controlled prop again — so a real
 * label that registers even later still always wins.
 */
const SelectValueIdContext = React.createContext<string | undefined>(undefined);

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null) {
        (ref as React.RefObject<T | null>).current = node;
      }
    }
  };
}

/** The chevron lives here, not in the styled wrapper: it is the trigger's
 *  `SelectPrimitive.Icon` part and carries the open/close state. */
function SelectTriggerPrimitive({
  children,
  ref,
  ...props
}: SelectTriggerPrimitiveProps) {
  const generatedId = React.useId();
  const hasOwnName =
    props["aria-label"] != null || props["aria-labelledby"] != null;
  const elementRef = React.useRef<HTMLButtonElement | null>(null);
  // Seeded `true` so the server render and the client's first (hydrating)
  // render agree — see the a11y (SSR) note above `SelectValueIdContext`.
  const [assumeNoRealLabelYet, setAssumeNoRealLabelYet] = React.useState(true);

  React.useEffect(() => {
    if (hasOwnName) {
      return;
    }
    if (assumeNoRealLabelYet) {
      // Stop forcing our own value as a controlled prop: base-ui's own
      // label registration (a layout effect) has already resolved by now if
      // a real one exists, so the next render reads its true value instead
      // of this component continuing to guess.
      setAssumeNoRealLabelYet(false);
      return;
    }
    const el = elementRef.current;
    // biome-ignore lint/suspicious/noUnnecessaryConditions: elementRef.current is genuinely HTMLButtonElement | null at runtime — assigned by mergeRefs' ref callback, which biome's narrowing doesn't trace through.
    if (el && !el.hasAttribute("aria-labelledby")) {
      el.setAttribute("aria-labelledby", generatedId);
    }
  });

  const fallbackProps =
    !hasOwnName && assumeNoRealLabelYet
      ? { "aria-labelledby": generatedId }
      : undefined;

  return (
    <BaseUISelect.Trigger
      data-slot="select-trigger"
      ref={mergeRefs(ref, elementRef)}
      {...fallbackProps}
      {...props}
    >
      <SelectValueIdContext.Provider
        value={hasOwnName ? undefined : generatedId}
      >
        {children}
      </SelectValueIdContext.Provider>
      <BaseUISelect.Icon data-slot="select-icon">
        <ChevronsUpDownIcon className={selectTriggerIconClassName} />
      </BaseUISelect.Icon>
    </BaseUISelect.Trigger>
  );
}

export type SelectTriggerProps = SelectTriggerPrimitiveProps &
  VariantProps<typeof selectTriggerVariants>;

function SelectTrigger({
  className,
  size = "default",
  ...props
}: SelectTriggerProps) {
  return (
    <SelectTriggerPrimitive
      className={cn(selectTriggerVariants({ size }), className)}
      {...props}
    />
  );
}

export type SelectValuePrimitiveProps = BaseUISelect.Value.Props;

function SelectValuePrimitive(props: SelectValuePrimitiveProps) {
  const generatedId = React.useContext(SelectValueIdContext);

  return (
    <BaseUISelect.Value data-slot="select-value" id={generatedId} {...props} />
  );
}

const selectValueVariants = cva({
  base: "flex-1 truncate data-placeholder:text-muted-foreground",
});

export type SelectValueProps = SelectValuePrimitiveProps;

function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectValuePrimitive
      className={cn(selectValueVariants(), className)}
      {...props}
    />
  );
}

const selectPopupVariants = cva({
  base: "origin-(--transform-origin) text-foreground outline-none",
});

/** The popup's inner chrome `<div>`: the border, surface and shadow that make
 *  the list look like a popover. Exported so a fork can compose over it. */
const selectPopupChromeVariants = cva({
  base: "relative h-full min-w-(--anchor-width) rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

/** The scroll box itself. The caller's `className` on `SelectPopup` merges
 *  into this one, exactly as it does in the base. */
const selectListVariants = cva({
  base: "max-h-(--available-height) overflow-y-auto p-1",
});

const selectScrollArrowVariants = cva({
  base: "z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:h-[200%] before:from-50% before:from-popover",
  variants: {
    direction: {
      down: "bottom-0 before:bottom-px before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t",
      up: "top-0 before:top-px before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b",
    },
  },
});

export interface SelectPopupPrimitiveProps extends BaseUISelect.Popup.Props {
  /** SEL-1: the positioning surface the v2 fork dropped. */
  side?: BaseUISelect.Positioner.Props["side"];
  sideOffset?: BaseUISelect.Positioner.Props["sideOffset"];
  align?: BaseUISelect.Positioner.Props["align"];
  alignOffset?: BaseUISelect.Positioner.Props["alignOffset"];
  alignItemWithTrigger?: BaseUISelect.Positioner.Props["alignItemWithTrigger"];
  anchor?: BaseUISelect.Positioner.Props["anchor"];
  portalProps?: BaseUISelect.Portal.Props;
  /** Props for the inner scroll box. The styled `SelectPopup` routes its own
   *  `className` here, which is what the base does with it. */
  listProps?: BaseUISelect.List.Props;
}

/**
 * Portal → Positioner → Popup → (scroll-up arrow, chrome, List, scroll-down
 * arrow), whole, because `alignItemWithTrigger` positions the popup against
 * the list and the arrows: splitting them out breaks the behaviour, not just
 * the look. The arrows and the chrome `<div>` are unreachable from outside, so
 * they carry their cva here; the positioner's `z-50 select-none` is layering,
 * not theme styling.
 */
function SelectPopupPrimitive({
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = true,
  anchor,
  portalProps,
  listProps,
  ...props
}: SelectPopupPrimitiveProps) {
  return (
    <BaseUISelect.Portal {...portalProps}>
      <BaseUISelect.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseUISelect.Popup data-slot="select-popup" {...props}>
          <BaseUISelect.ScrollUpArrow
            className={selectScrollArrowVariants({ direction: "up" })}
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon className="relative size-4" />
          </BaseUISelect.ScrollUpArrow>
          <div className={selectPopupChromeVariants()}>
            <BaseUISelect.List data-slot="select-list" {...listProps}>
              {children}
            </BaseUISelect.List>
          </div>
          <BaseUISelect.ScrollDownArrow
            className={selectScrollArrowVariants({ direction: "down" })}
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon className="relative size-4" />
          </BaseUISelect.ScrollDownArrow>
        </BaseUISelect.Popup>
      </BaseUISelect.Positioner>
    </BaseUISelect.Portal>
  );
}

export type SelectPopupProps = SelectPopupPrimitiveProps;

function SelectPopup({ className, listProps, ...props }: SelectPopupProps) {
  return (
    <SelectPopupPrimitive
      className={selectPopupVariants()}
      listProps={{
        ...listProps,
        className: cn(selectListVariants(), className, listProps?.className),
      }}
      {...props}
    />
  );
}

export type SelectItemPrimitiveProps = BaseUISelect.Item.Props;

/** The indicator and the text live here because the grid columns
 *  (`grid-cols-[1rem_minmax(0,1fr)]` / `col-start-1` / `col-start-2`) are what
 *  position them. XC-2: the indicator is `aria-hidden`, has the real SVG
 *  namespace and no `<title>` for a screen reader to announce. */
function SelectItemPrimitive({ children, ...props }: SelectItemPrimitiveProps) {
  return (
    <BaseUISelect.Item data-slot="select-item" {...props}>
      <BaseUISelect.ItemIndicator className="col-start-1">
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
      </BaseUISelect.ItemIndicator>
      <BaseUISelect.ItemText className="wrap-anywhere col-start-2 min-w-0">
        {children}
      </BaseUISelect.ItemText>
    </BaseUISelect.Item>
  );
}

const selectItemVariants = cva({
  base: "grid min-h-7 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-sm py-1 ps-2 pe-4 text-sm outline-none data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-64 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

export type SelectItemProps = SelectItemPrimitiveProps;

function SelectItem({ className, ...props }: SelectItemProps) {
  return (
    <SelectItemPrimitive
      className={cn(selectItemVariants(), className)}
      {...props}
    />
  );
}

const selectSeparatorVariants = cva({ base: "mx-2 my-1 h-px bg-border" });

export type SelectSeparatorProps = BaseUISelect.Separator.Props;

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <BaseUISelect.Separator
      className={cn(selectSeparatorVariants(), className)}
      data-slot="select-separator"
      {...props}
    />
  );
}

export type SelectGroupProps = BaseUISelect.Group.Props;

function SelectGroup(props: SelectGroupProps) {
  return <BaseUISelect.Group data-slot="select-group" {...props} />;
}

const selectGroupLabelVariants = cva({
  base: "px-2 py-1.5 font-medium text-muted-foreground text-xs",
});

export type SelectGroupLabelProps = BaseUISelect.GroupLabel.Props;

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <BaseUISelect.GroupLabel
      className={cn(selectGroupLabelVariants(), className)}
      data-slot="select-group-label"
      {...props}
    />
  );
}

const selectLabelVariants = cva({
  base: "not-in-data-[slot=field]:mb-2 inline-flex cursor-default items-center gap-2 font-medium text-sm/4 text-foreground",
});

export type SelectLabelProps = BaseUISelect.Label.Props;

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <BaseUISelect.Label
      className={cn(selectLabelVariants(), className)}
      data-slot="select-label"
      {...props}
    />
  );
}

export {
  BaseUISelect as SelectPrimitive,
  Select,
  SelectButton,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemPrimitive,
  SelectLabel,
  SelectPopup as SelectContent,
  SelectPopup,
  SelectPopupPrimitive,
  SelectSeparator,
  SelectTrigger,
  SelectTriggerPrimitive,
  SelectValue,
  SelectValuePrimitive,
  selectGroupLabelVariants,
  selectItemVariants,
  selectLabelVariants,
  selectListVariants,
  selectPopupChromeVariants,
  selectPopupVariants,
  selectScrollArrowVariants,
  selectSeparatorVariants,
  selectTriggerIconClassName,
  selectTriggerVariants,
  selectValueVariants,
};
