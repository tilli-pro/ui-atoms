"use client";

import * as React from "react";
import { Tabs as BaseUITabs } from "@base-ui/react/tabs";
import { cva } from "cva";
import {
  type SegmentedControlSize,
  segmentedControlItemLayoutClassName,
  segmentedControlItemSizeClassNames,
} from "../../lib/segmented-control.js";
import { cn } from "../../utils.js";

// coss base `.coss-base/tabs.tsx` @8163481 plus TAB-2: the `size` prop and the
// segmented-control size context. TAB-1 (`data-active`) and TAB-3
// (`tabs-trigger` → `tabs-tab`) come with the base. The size ramp is collapsed
// to its `sm:` member both in this file's own strings and in the shared
// `../../lib/segmented-control.js` records this file pastes onto every tab —
// `tabs` is one of the fourteen components the hold-back names, so no `sm:`
// size pair reaches it from either source. See that file's header for the
// TAB-2 "verbatim" deviation this implies.

const tabsVariants = cva({
  base: "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
});

const tabsListVariants = cva({
  base: "relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-muted-foreground data-[orientation=vertical]:flex-col",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      // a11y: the base's `/72` opacity on the inactive-tab text drops
      // contrast against `bg-muted` (#f5f5f5) to 2.67:1, well under 4.5:1 AA —
      // no darkening of `--muted-foreground` closes that gap at 72% alpha, so
      // the fix is full-strength text, matching the `underline` variant.
      default: "rounded-lg bg-muted p-0.5 text-muted-foreground",
      underline:
        "data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-1 *:data-[slot=tabs-tab]:hover:bg-accent",
    },
  },
});

const tabsIndicatorVariants = cva({
  base: "absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "-z-1 rounded-md bg-background shadow-sm/5 dark:bg-input",
      underline:
        "z-10 bg-primary data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px data-[orientation=horizontal]:translate-y-px",
    },
  },
});

const tabsTabVariants = cva({
  base: "relative flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium text-sm outline-none transition-[color,background-color,box-shadow] hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:text-foreground data-disabled:opacity-64",
});

const tabsPanelVariants = cva({ base: "flex-1 outline-none" });

export type TabsSize = SegmentedControlSize;
export type TabsVariant = "default" | "underline";

/** TAB-2: the list's `size`, read by every `TabsTab` below it. */
const TabsListContext = React.createContext<TabsSize>("default");

export type TabsPrimitiveProps = BaseUITabs.Root.Props;

function TabsPrimitive(props: TabsPrimitiveProps) {
  return <BaseUITabs.Root data-slot="tabs" {...props} />;
}

export type TabsProps = TabsPrimitiveProps;

function Tabs({ className, ...props }: TabsProps) {
  return <TabsPrimitive className={cn(tabsVariants(), className)} {...props} />;
}

export interface TabsListPrimitiveProps extends BaseUITabs.List.Props {
  /** TAB-2: shared with every tab below through `TabsListContext`. */
  size?: TabsSize;
}

interface TabsListPrimitiveInternalProps extends TabsListPrimitiveProps {
  /** Internal channel for the active-tab indicator's class set. */
  indicatorClassName?: string;
}

function TabsListPrimitive({
  children,
  indicatorClassName,
  size = "default",
  ...props
}: TabsListPrimitiveInternalProps) {
  return (
    <BaseUITabs.List data-size={size} data-slot="tabs-list" {...props}>
      <TabsListContext.Provider value={size}>
        {children}
      </TabsListContext.Provider>
      <BaseUITabs.Indicator
        className={indicatorClassName}
        data-slot="tab-indicator"
      />
    </BaseUITabs.List>
  );
}

export interface TabsListProps extends TabsListPrimitiveProps {
  variant?: TabsVariant;
}

function TabsList({
  className,
  size = "default",
  variant = "default",
  ...props
}: TabsListProps) {
  return (
    <TabsListPrimitive
      className={cn(tabsListVariants({ variant }), className)}
      indicatorClassName={cn(tabsIndicatorVariants({ variant }))}
      size={size}
      {...props}
    />
  );
}

export interface TabsTabPrimitiveProps extends BaseUITabs.Tab.Props {
  size?: TabsSize;
}

function TabsTabPrimitive({ size, ...props }: TabsTabPrimitiveProps) {
  const contextSize = React.useContext(TabsListContext);

  return (
    <BaseUITabs.Tab
      data-size={size ?? contextSize}
      data-slot="tabs-tab"
      {...props}
    />
  );
}

export type TabsTabProps = TabsTabPrimitiveProps;

function TabsTab({ className, size, ...props }: TabsTabProps) {
  const contextSize = React.useContext(TabsListContext);
  const resolvedSize = size ?? contextSize;

  return (
    <TabsTabPrimitive
      className={cn(
        tabsTabVariants(),
        segmentedControlItemLayoutClassName,
        segmentedControlItemSizeClassNames[resolvedSize],
        className,
      )}
      size={resolvedSize}
      {...props}
    />
  );
}

export type TabsPanelPrimitiveProps = BaseUITabs.Panel.Props;

function TabsPanelPrimitive(props: TabsPanelPrimitiveProps) {
  return <BaseUITabs.Panel data-slot="tabs-content" {...props} />;
}

export type TabsPanelProps = TabsPanelPrimitiveProps;

function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <TabsPanelPrimitive
      className={cn(tabsPanelVariants(), className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsListPrimitive,
  TabsPanel,
  // The base ships these aliases itself, so the retirement of shadcn aliases
  // does not reach them (same exception as `CardContent`).
  TabsPanel as TabsContent,
  TabsPanelPrimitive,
  TabsPrimitive,
  TabsTab,
  TabsTab as TabsTrigger,
  TabsTabPrimitive,
  tabsIndicatorVariants,
  tabsListVariants,
  tabsPanelVariants,
  tabsTabVariants,
  tabsVariants,
};
