"use client";

import * as React from "react";
import { Slider as BaseUISlider } from "@base-ui/react/slider";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/slider.tsx` @8163481, with the thumb's size ramp
// collapsed to its `sm:` member (`size-5 … sm:size-4` → `size-4`). SLD-1's
// `index` on the thumb and SLD-2's `className` on the Root (not the Control)
// are both the base's behaviour.

const sliderVariants = cva({
  base: "data-[orientation=horizontal]:w-full",
});

const sliderControlVariants = cva({
  base: "flex touch-none select-none data-disabled:pointer-events-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:min-w-44 data-[orientation=vertical]:flex-col data-disabled:opacity-64",
});

const sliderTrackVariants = cva({
  base: "relative grow select-none before:absolute before:rounded-full before:bg-input data-[orientation=horizontal]:h-1 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1 data-[orientation=horizontal]:before:inset-x-0.5 data-[orientation=vertical]:before:inset-x-0 data-[orientation=horizontal]:before:inset-y-0 data-[orientation=vertical]:before:inset-y-0.5",
});

const sliderIndicatorVariants = cva({
  base: "select-none rounded-full bg-primary data-[orientation=horizontal]:ms-0.5 data-[orientation=vertical]:mb-0.5",
});

const sliderThumbVariants = cva({
  base: "block size-4 shrink-0 select-none rounded-full border border-input bg-white not-dark:bg-clip-padding shadow-xs/5 outline-none transition-[box-shadow,scale] before:absolute before:inset-0 before:rounded-full before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:ring-[3px] has-focus-visible:ring-ring/24 data-dragging:scale-120 dark:border-background dark:has-focus-visible:ring-ring/48 [:has(*:focus-visible),[data-dragging]]:shadow-none",
});

const sliderValueVariants = cva({ base: "flex justify-end text-sm" });

export type SliderPrimitiveProps = BaseUISlider.Root.Props;

interface SliderPrimitiveInternalProps extends SliderPrimitiveProps {
  /** Internal channels for the sub-part class sets — deliberately not part of
   *  `SliderPrimitiveProps`, so the primitive stays classless. */
  controlClassName?: string;
  indicatorClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
  /** a11y: per-thumb accessible name, for a multi-thumb (range)
   *  slider where each handle needs a distinct name (e.g. "Minimum price"). */
  getAriaLabel?: (index: number) => string;
}

function SliderPrimitive({
  children,
  controlClassName,
  defaultValue,
  indicatorClassName,
  max = 100,
  min = 0,
  thumbClassName,
  trackClassName,
  value,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  getAriaLabel,
  ...props
}: SliderPrimitiveInternalProps) {
  const thumbCount = React.useMemo(() => {
    if (value !== undefined) return Array.isArray(value) ? value.length : 1;
    if (defaultValue !== undefined)
      return Array.isArray(defaultValue) ? defaultValue.length : 1;
    return 1;
  }, [value, defaultValue]);

  return (
    <BaseUISlider.Root
      defaultValue={defaultValue}
      max={max}
      min={min}
      thumbAlignment="edge"
      value={value}
      {...props}
    >
      {children}
      <BaseUISlider.Control
        className={controlClassName}
        data-slot="slider-control"
      >
        <BaseUISlider.Track className={trackClassName} data-slot="slider-track">
          <BaseUISlider.Indicator
            className={indicatorClassName}
            data-slot="slider-indicator"
          />
          {Array.from({ length: thumbCount }, (_, index) => (
            <BaseUISlider.Thumb
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              className={thumbClassName}
              data-slot="slider-thumb"
              getAriaLabel={getAriaLabel}
              index={index}
              key={String(index)}
            />
          ))}
        </BaseUISlider.Track>
      </BaseUISlider.Control>
    </BaseUISlider.Root>
  );
}

export type SliderProps = SliderPrimitiveProps &
  Pick<SliderPrimitiveInternalProps, "getAriaLabel">;

function Slider({ className, ...props }: SliderProps) {
  return (
    <SliderPrimitive
      className={cn(sliderVariants(), className)}
      controlClassName={sliderControlVariants()}
      indicatorClassName={sliderIndicatorVariants()}
      thumbClassName={sliderThumbVariants()}
      trackClassName={sliderTrackVariants()}
      {...props}
    />
  );
}

export type SliderValuePrimitiveProps = BaseUISlider.Value.Props;

function SliderValuePrimitive(props: SliderValuePrimitiveProps) {
  return <BaseUISlider.Value data-slot="slider-value" {...props} />;
}

export type SliderValueProps = SliderValuePrimitiveProps;

function SliderValue({ className, ...props }: SliderValueProps) {
  return (
    <SliderValuePrimitive
      className={cn(sliderValueVariants(), className)}
      {...props}
    />
  );
}

export {
  Slider,
  SliderPrimitive,
  SliderValue,
  SliderValuePrimitive,
  sliderControlVariants,
  sliderIndicatorVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  sliderValueVariants,
  sliderVariants,
};
