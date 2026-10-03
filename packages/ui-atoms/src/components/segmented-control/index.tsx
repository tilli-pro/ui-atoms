"use client";

import { cn } from "../../utils.js";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  ariaLabelledBy?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Two-or-more-way toggle; fully controlled. Use inside RHF `Controller`.
 */
export function SegmentedControl({
  ariaLabelledBy,
  className,
  disabled = false,
  id,
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "flex w-full overflow-hidden rounded-md border bg-popover text-popover-foreground",
        className,
      )}
      id={id}
      role="radiogroup"
    >
      {options.map((option, index) => (
        <button
          aria-checked={value === option.value}
          className={cn(
            "inline-flex min-h-8 flex-1 items-center justify-center px-3 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            {
              "border-border border-l": index > 0,
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground":
                value === option.value,
            },
          )}
          disabled={disabled}
          key={option.value}
          onClick={() => {
            onChange(option.value);
          }}
          role="radio"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
