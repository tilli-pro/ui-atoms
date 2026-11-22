import { type Oklch, toHex } from "./color.js";
import { blue, cyan } from "./palette.js";

/** The U mark: two strokes, the blue one in front. Paths are the brand asset's. */
export function Mark({
  className,
  left = blue[500],
  right = cyan[400],
}: {
  className?: string;
  left?: Oklch;
  right?: Oklch;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 88 99"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M87.1665 0C87.1665 0 87.1665 31.5714 87.1665 49.5816C87.1665 80.3402 53 80.2546 53 80.2546V23.4432L87.1665 0Z"
        fill={toHex(right)}
      />
      <path
        d="M34.1665 9C34.1665 9 34.1665 49.5551 34.1665 61.3195C34.1665 82.966 53.9583 80.2709 53.9583 80.2709C53.9583 80.2709 53.0626 98.3239 34.1665 98.3239C15.2704 98.3239 0 88.399 0 66.7525C0 50.539 0 32.486 0 32.486L34.1665 9Z"
        fill={toHex(left)}
      />
    </svg>
  );
}

/** The mark beside the wordmark set in Sora, the wordmark's new face. */
export function Lockup({
  ink,
  size = "md",
}: {
  ink: Oklch;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={
        size === "lg"
          ? "inline-flex items-center gap-3"
          : "inline-flex items-center gap-2"
      }
    >
      <Mark className={size === "lg" ? "h-14 w-auto" : "h-8 w-auto"} />
      <span
        className={
          size === "lg"
            ? "font-heading font-semibold text-5xl tracking-wide"
            : "font-heading font-semibold text-2xl tracking-wide"
        }
        style={{ color: toHex(ink) }}
      >
        tilli
      </span>
    </span>
  );
}
