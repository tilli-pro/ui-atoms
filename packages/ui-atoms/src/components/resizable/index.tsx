"use client";

import type * as React from "react";
import { cva } from "cva";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "../../utils.js";

// shadcn/ui's resizable for react-resizable-panels 4.x: base
// `.shadcn-base/resizable.tsx`, digest-pinned in scripts/shadcn/shadcn-lock.json,
// taken for its 4.x shape (`Group` / `Separator`, `aria-orientation` selectors)
// and split into the styled/primitive/variants triple like the coss-based parts.
// RSZ-1 is what stays ours, and it is all styling:
//
//  - the handle shows a bordered grip with a lucide icon, where the base draws a
//    plain bar; it is its own part (`ResizableHandleGrip`) on the popup surface
//    tokens the coss components use;
//  - focus is the coss field treatment (the line turns `ring`, with a 3px
//    `ring/24` halo) instead of the base's `ring-1`; an offset ring would paint
//    over a 1px line. The line also picks up `ring` on hover and while dragging through
//    the library's `data-separator` state; a disabled handle fades to `opacity-64`
//    like every other disabled control here.
//
// 4.x changes what consumers pass, not just what this file imports:
// `direction` is now `orientation`; a numeric size is PIXELS, and a percentage
// is a string (`defaultSize="50%"`); `autoSaveId` is gone in favour of
// `useDefaultLayout`; `onLayout` is `onLayoutChange`.

const resizablePanelGroupVariants = cva({
  base: "flex h-full w-full aria-[orientation=vertical]:flex-col",
});

// A separator's own `aria-orientation` is the axis of the LINE, so a handle
// between stacked panels reports `horizontal`.
const resizableHandleVariants = cva({
  base: "relative flex w-px items-center justify-center bg-border outline-none transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:bg-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 data-[separator=active]:bg-ring data-[separator=hover]:bg-ring/64 data-[separator=disabled]:opacity-64 [&[aria-orientation=horizontal]>[data-slot=resizable-handle-grip]]:rotate-90",
});

const resizableHandleGripVariants = cva({
  base: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-popover not-dark:bg-clip-padding text-muted-foreground shadow-xs/5 [&_svg:not([class*='size-'])]:size-2.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

export type ResizablePanelGroupPrimitiveProps = ResizablePrimitive.GroupProps;

function ResizablePanelGroupPrimitive(
  props: ResizablePanelGroupPrimitiveProps,
) {
  return (
    <ResizablePrimitive.Group data-slot="resizable-panel-group" {...props} />
  );
}

export type ResizablePanelGroupProps = ResizablePanelGroupPrimitiveProps;

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizablePanelGroupPrimitive
      className={cn(resizablePanelGroupVariants(), className)}
      {...props}
    />
  );
}

export type ResizablePanelProps = ResizablePrimitive.PanelProps;

/** Carries no classes of its own: the library sizes it, the consumer fills it. */
function ResizablePanel(props: ResizablePanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

export type ResizableHandlePrimitiveProps = ResizablePrimitive.SeparatorProps;

function ResizableHandlePrimitive(props: ResizableHandlePrimitiveProps) {
  return (
    <ResizablePrimitive.Separator data-slot="resizable-handle" {...props} />
  );
}

export type ResizableHandleGripPrimitiveProps = React.ComponentProps<"div">;

function ResizableHandleGripPrimitive(
  props: ResizableHandleGripPrimitiveProps,
) {
  return <div data-slot="resizable-handle-grip" {...props} />;
}

export type ResizableHandleGripProps = ResizableHandleGripPrimitiveProps;

/** The visible grip on a handle. `ResizableHandle withHandle` renders one; use
 *  it directly to swap the icon. */
function ResizableHandleGrip({
  children,
  className,
  ...props
}: ResizableHandleGripProps) {
  return (
    <ResizableHandleGripPrimitive
      className={cn(resizableHandleGripVariants(), className)}
      {...props}
    >
      {children ?? <GripVerticalIcon aria-hidden="true" />}
    </ResizableHandleGripPrimitive>
  );
}

export interface ResizableHandleProps extends ResizableHandlePrimitiveProps {
  /** Shows the grip in the middle of the line. */
  withHandle?: boolean;
}

function ResizableHandle({
  children,
  className,
  withHandle = false,
  ...props
}: ResizableHandleProps) {
  return (
    <ResizableHandlePrimitive
      className={cn(resizableHandleVariants(), className)}
      {...props}
    >
      {withHandle && <ResizableHandleGrip />}
      {children}
    </ResizableHandlePrimitive>
  );
}

export {
  ResizableHandle,
  ResizableHandleGrip,
  ResizableHandleGripPrimitive,
  ResizableHandlePrimitive,
  ResizablePanel,
  ResizablePanelGroup,
  ResizablePanelGroupPrimitive,
  resizableHandleGripVariants,
  resizableHandleVariants,
  resizablePanelGroupVariants,
};
