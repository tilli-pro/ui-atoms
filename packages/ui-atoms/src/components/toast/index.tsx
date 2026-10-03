"use client";

import type * as React from "react";
import { Toast as BaseUIToast } from "@base-ui/react/toast";
import { cva } from "cva";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "../../utils.js";
import { buttonVariants } from "../button/index.js";

// coss base `.coss-base/toast.tsx` @8163481: TST-1's anchored stack, TST-2's
// `portalProps`, TST-3's per-toast `rootProps` (there is no `data-slot` on
// `Toast.Root`, so `rootProps` is how a caller reaches it), TST-5's exported
// props types, the per-position exit direction and the
// `data-behind:not-data-expanded:` fix all arrive with the base.
//
// TST-4 is half here and half in `src/styles.css`: `upsertReplayClassName()` is
// the base's, but coss keeps the four `animate-toast-*` keyframes outside the
// registry, so they are authored in our sheet. This is the one place the pinned
// base is incomplete.

const TOAST_ICONS = {
  error: CircleAlertIcon,
  info: InfoIcon,
  loading: LoaderCircleIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
} as const;

const toastViewportVariants = cva({
  base: cn(
    "fixed z-60 mx-auto flex w-[calc(100%-var(--toast-inset)*2)] max-w-90 [--toast-inset:--spacing(4)] sm:[--toast-inset:--spacing(8)]",
    // Vertical positioning
    "data-[position*=top]:top-(--toast-inset)",
    "data-[position*=bottom]:bottom-(--toast-inset)",
    // Horizontal positioning
    "data-[position*=left]:left-(--toast-inset)",
    "data-[position*=right]:right-(--toast-inset)",
    "data-[position*=center]:left-1/2 data-[position*=center]:-translate-x-1/2",
  ),
});

const toastRootVariants = cva({
  base: cn(
    "absolute z-[calc(9999-var(--toast-index))] h-(--toast-calc-height) w-full select-none rounded-lg border bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(1%*max(0,var(--toast-index,0))))] not-dark:bg-clip-padding text-popover-foreground shadow-lg/5 [transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s,background-color_.5s] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-expanded:bg-popover dark:bg-[color-mix(in_srgb,var(--popover),var(--color-black)_calc(6%*max(0,var(--toast-index,0))))] dark:data-expanded:bg-popover dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
    // Base positioning using data-position
    "data-[position*=right]:right-0 data-[position*=right]:left-auto",
    "data-[position*=left]:right-auto data-[position*=left]:left-0",
    "data-[position*=center]:right-0 data-[position*=center]:left-0",
    "data-[position*=top]:top-0 data-[position*=top]:bottom-auto data-[position*=top]:origin-[50%_calc(50%-50%*min(var(--toast-index,0),1))]",
    "data-[position*=bottom]:top-auto data-[position*=bottom]:bottom-0 data-[position*=bottom]:origin-[50%_calc(50%+50%*min(var(--toast-index,0),1))]",
    // Gap fill for hover
    "after:absolute after:left-0 after:h-[calc(var(--toast-gap)+1px)] after:w-full",
    "data-[position*=top]:after:top-full",
    "data-[position*=bottom]:after:bottom-full",
    // Define some variables
    "[--toast-calc-height:var(--toast-frontmost-height,var(--toast-height))] [--toast-gap:--spacing(3)] [--toast-peek:--spacing(3)] [--toast-scale:calc(max(0,1-(var(--toast-index)*.1)))] [--toast-shrink:calc(1-var(--toast-scale))]",
    // Define offset-y variable
    "data-[position*=top]:[--toast-calc-offset-y:calc(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap)+var(--toast-swipe-movement-y))]",
    "data-[position*=bottom]:[--toast-calc-offset-y:calc(var(--toast-offset-y)*-1+var(--toast-index)*var(--toast-gap)*-1+var(--toast-swipe-movement-y))]",
    // Default state transform
    "data-[position*=top]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek))+(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    "data-[position*=bottom]:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--toast-peek))-(var(--toast-shrink)*var(--toast-calc-height))))_scale(var(--toast-scale))]",
    // Limited state
    "data-limited:opacity-0",
    // Expanded state
    "data-expanded:h-(--toast-height)",
    "data-position:data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-calc-offset-y))]",
    // Starting and ending animations
    "data-[position*=top]:data-starting-style:transform-[translateY(calc(-100%-var(--toast-inset)))]",
    "data-[position*=bottom]:data-starting-style:transform-[translateY(calc(100%+var(--toast-inset)))]",
    "data-ending-style:opacity-0",
    // Ending animations (direction-aware)
    "data-[position*=top]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(-100%-var(--toast-inset)))]",
    "data-[position*=bottom]:data-ending-style:not-data-limited:not-data-swipe-direction:transform-[translateY(calc(100%+var(--toast-inset)))]",
    "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
    "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
    // Ending animations (expanded)
    "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-100%-var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+100%+var(--toast-inset)))_translateY(var(--toast-calc-offset-y))]",
    "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-100%-var(--toast-inset)))]",
    "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+100%+var(--toast-inset)))]",
  ),
});

const toastContentVariants = cva({
  base: "pointer-events-auto flex items-center justify-between gap-1.5 overflow-hidden px-3.5 py-3 text-sm transition-opacity duration-250 data-behind:not-data-expanded:pointer-events-none data-behind:opacity-0 data-expanded:opacity-100",
});

const toastIconVariants = cva({
  base: "[&>svg]:h-lh [&>svg]:w-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
});

const toastTitleVariants = cva({ base: "font-medium" });
const toastDescriptionVariants = cva({ base: "text-muted-foreground" });

const anchoredToastPositionerVariants = cva({
  base: "z-60 max-w-[min(--spacing(64),var(--available-width))]",
});

const anchoredToastRootVariants = cva({
  base: "relative text-balance border bg-popover not-dark:bg-clip-padding text-popover-foreground text-xs transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
  defaultVariants: { tooltipStyle: false },
  variants: {
    tooltipStyle: {
      false:
        "rounded-lg shadow-lg/5 before:rounded-[calc(var(--radius-lg)-1px)]",
      true: "rounded-md shadow-md/5 before:rounded-[calc(var(--radius-md)-1px)]",
    },
  },
});

const anchoredToastContentVariants = cva({
  base: "pointer-events-auto",
  defaultVariants: { tooltipStyle: false },
  variants: {
    tooltipStyle: {
      false:
        "flex items-center justify-between gap-1.5 overflow-hidden px-3.5 py-3 text-sm",
      true: "px-2 py-1",
    },
  },
});

export type ToastPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

type SwipeDirection = "down" | "left" | "right" | "up";

/** TST-3: the `data` payload a caller attaches to reach the toast root. */
export type ToastData = {
  rootProps?: Omit<
    React.ComponentProps<typeof BaseUIToast.Root>,
    "children" | "className" | "swipeDirection" | "toast"
  >;
  tooltipStyle?: boolean;
};

function getSwipeDirection(position: ToastPosition): SwipeDirection[] {
  const verticalDirection: SwipeDirection = position.startsWith("top")
    ? "up"
    : "down";

  if (position.includes("center")) return [verticalDirection];
  if (position.includes("left")) return ["left", verticalDirection];
  return ["right", verticalDirection];
}

/**
 * TST-4. `updateKey` is 0 on `add` and increments on every `update`, so
 * alternating the class name between the odd and even keyframe pair is what
 * makes the browser replay the animation rather than ignore a repeat.
 */
function upsertReplayClassName(toast: {
  type?: string;
  updateKey?: number;
}): string | undefined {
  const k = toast.updateKey ?? 0;
  if (k <= 0) return;
  const isEven = k % 2 === 0;
  if (toast.type === "error") {
    return isEven ? "animate-toast-error-even" : "animate-toast-error-odd";
  }
  return isEven ? "animate-toast-success-even" : "animate-toast-success-odd";
}

function ToastBody({ toast }: { toast: BaseUIToast.Root.Props["toast"] }) {
  const Icon = toast.type
    ? TOAST_ICONS[toast.type as keyof typeof TOAST_ICONS]
    : null;

  return (
    <>
      <div className="flex gap-2">
        {Icon && (
          <div className={toastIconVariants()} data-slot="toast-icon">
            <Icon className="in-data-[type=loading]:animate-spin in-data-[type=error]:text-destructive in-data-[type=info]:text-info in-data-[type=success]:text-success in-data-[type=warning]:text-warning in-data-[type=loading]:opacity-80" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <BaseUIToast.Title
            className={toastTitleVariants()}
            data-slot="toast-title"
          />
          <BaseUIToast.Description
            className={toastDescriptionVariants()}
            data-slot="toast-description"
          />
        </div>
      </div>
      {toast.actionProps && (
        <BaseUIToast.Action
          className={buttonVariants({ size: "xs" })}
          data-slot="toast-action"
        >
          {toast.actionProps.children}
        </BaseUIToast.Action>
      )}
    </>
  );
}

function Toasts({
  portalProps,
  position,
}: {
  portalProps?: React.ComponentProps<typeof BaseUIToast.Portal>;
  position: ToastPosition;
}) {
  const { toasts } = BaseUIToast.useToastManager();
  const swipeDirection = getSwipeDirection(position);

  return (
    <BaseUIToast.Portal data-slot="toast-portal" {...portalProps}>
      <BaseUIToast.Viewport
        className={toastViewportVariants()}
        data-position={position}
        data-slot="toast-viewport"
      >
        {toasts.map((toast) => {
          const toastData = toast.data as ToastData | undefined;

          return (
            <BaseUIToast.Root
              className={cn(toastRootVariants(), upsertReplayClassName(toast))}
              key={toast.id}
              {...toastData?.rootProps}
              data-position={position}
              swipeDirection={swipeDirection}
              toast={toast}
            >
              <BaseUIToast.Content className={toastContentVariants()}>
                <ToastBody toast={toast} />
              </BaseUIToast.Content>
            </BaseUIToast.Root>
          );
        })}
      </BaseUIToast.Viewport>
    </BaseUIToast.Portal>
  );
}

function AnchoredToasts({
  portalProps,
}: {
  portalProps?: React.ComponentProps<typeof BaseUIToast.Portal>;
}) {
  const { toasts } = BaseUIToast.useToastManager();

  return (
    <BaseUIToast.Portal data-slot="toast-portal-anchored" {...portalProps}>
      <BaseUIToast.Viewport
        className="outline-none"
        data-slot="toast-viewport-anchored"
      >
        {toasts.map((toast) => {
          const toastData = toast.data as ToastData | undefined;
          const tooltipStyle = toastData?.tooltipStyle ?? false;
          const positionerProps = toast.positionerProps;

          if (!positionerProps?.anchor) return null;

          return (
            <BaseUIToast.Positioner
              className={anchoredToastPositionerVariants()}
              data-slot="toast-positioner"
              key={toast.id}
              sideOffset={positionerProps.sideOffset ?? 4}
              toast={toast}
            >
              <BaseUIToast.Root
                className={cn(
                  anchoredToastRootVariants({ tooltipStyle }),
                  upsertReplayClassName(toast),
                )}
                {...toastData?.rootProps}
                data-slot="toast-popup"
                toast={toast}
              >
                <BaseUIToast.Content
                  className={anchoredToastContentVariants({ tooltipStyle })}
                >
                  {tooltipStyle ? (
                    <BaseUIToast.Title data-slot="toast-title" />
                  ) : (
                    <ToastBody toast={toast} />
                  )}
                </BaseUIToast.Content>
              </BaseUIToast.Root>
            </BaseUIToast.Positioner>
          );
        })}
      </BaseUIToast.Viewport>
    </BaseUIToast.Portal>
  );
}

const toastManager = BaseUIToast.createToastManager();
const anchoredToastManager = BaseUIToast.createToastManager();

export interface ToastProviderProps extends BaseUIToast.Provider.Props {
  portalProps?: React.ComponentProps<typeof BaseUIToast.Portal>;
  position?: ToastPosition;
}

function ToastProvider({
  children,
  portalProps,
  position = "bottom-right",
  ...props
}: ToastProviderProps) {
  return (
    <BaseUIToast.Provider toastManager={toastManager} {...props}>
      {children}
      <Toasts portalProps={portalProps} position={position} />
    </BaseUIToast.Provider>
  );
}

export interface AnchoredToastProviderProps extends BaseUIToast.Provider.Props {
  portalProps?: React.ComponentProps<typeof BaseUIToast.Portal>;
}

function AnchoredToastProvider({
  children,
  portalProps,
  ...props
}: AnchoredToastProviderProps) {
  return (
    <BaseUIToast.Provider toastManager={anchoredToastManager} {...props}>
      {children}
      <AnchoredToasts portalProps={portalProps} />
    </BaseUIToast.Provider>
  );
}

export {
  AnchoredToastProvider,
  anchoredToastContentVariants,
  anchoredToastManager,
  anchoredToastPositionerVariants,
  anchoredToastRootVariants,
  ToastProvider,
  toastContentVariants,
  toastDescriptionVariants,
  toastIconVariants,
  toastManager,
  toastRootVariants,
  toastTitleVariants,
  toastViewportVariants,
};
