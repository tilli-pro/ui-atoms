import { useEffect, useState } from "react";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { contrast, formatOklch, inSrgb, type Oklch, toHex } from "./color.js";
import { neutral, type Step } from "./palette.js";

/** Black or white, whichever reads better on `color`. */
export const inkOn = (color: Oklch): Oklch =>
  contrast(color, neutral[950]) >= contrast(color, neutral[0])
    ? neutral[950]
    : neutral[0];

export function Ratio({
  value,
  need,
  className,
}: {
  value: number;
  /** 4.5 for text, 3 for large text and controls. */
  need: number;
  className?: string;
}) {
  const pass = value >= need;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-xs",
        pass
          ? "bg-success/12 text-success-foreground"
          : "bg-destructive/12 text-destructive-foreground",
        className,
      )}
    >
      {value.toFixed(2)}
      <span className="font-sans">{pass ? "passes" : "fails"}</span>
    </span>
  );
}

/** A colour tile that copies its OKLCH value when pressed. */
export function Swatch({ step, color, note }: Step) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  const value = formatOklch(color);
  const hex = toHex(color);
  const ink = toHex(inkOn(color));
  const copy = () => {
    navigator.clipboard?.writeText(value).then(
      () => setCopied(true),
      () => undefined,
    );
  };

  return (
    <button
      className="group flex flex-col overflow-hidden rounded-lg border bg-card text-left outline-none transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
      onClick={copy}
      title={`Copy ${value}`}
      type="button"
    >
      <span
        className="flex h-20 items-start justify-between p-2 font-heading font-semibold text-sm"
        style={{ backgroundColor: hex, color: ink }}
      >
        {step}
        <span className="font-normal font-sans text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {copied ? "Copied" : "Copy"}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-0.5 p-2">
        <span className="font-mono text-[0.6875rem] leading-tight">
          {value}
        </span>
        <span className="font-mono text-[0.6875rem] text-muted-foreground uppercase leading-tight">
          {hex}
          {inSrgb(color) ? "" : " (clipped)"}
        </span>
        {note ? (
          <span className="mt-1 text-muted-foreground text-xs leading-snug">
            {note}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function Ramp({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {steps.map((step) => (
        <Swatch key={step.step} {...step} />
      ))}
    </div>
  );
}

/** A small filled square with the colour's hex beside it. */
export function Chip({ color }: { color: Oklch }) {
  const hex = toHex(color);
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="size-5 shrink-0 rounded-sm border border-black/10"
        style={{ backgroundColor: hex }}
      />
      <span className="font-mono text-xs uppercase">
        {hex}
        {inSrgb(color) ? "" : " (clipped)"}
      </span>
    </span>
  );
}
