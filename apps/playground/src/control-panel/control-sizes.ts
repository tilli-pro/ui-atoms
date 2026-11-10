/**
 * The `xs` size that the source atoms offered and `@tilli.dev/ui-atoms` does
 * not. Each string is the source's `xs` variant with its responsive ramp
 * collapsed to the `sm:` member, the same way ui-atoms collapses the others.
 * They are applied through `className` and win over the atoms' own size via
 * `cn`'s tailwind-merge.
 */

/** `Input` / `InputGroupInput`: the caller's class lands on the wrapper, so the inner input is reached by selector. */
export const xsInputClassName =
  "[&_input]:h-5 [&_input]:px-[calc(--spacing(2)-1px)] [&_input]:text-[10px] [&_input]:leading-5";

/** `SelectTrigger`. */
export const xsSelectTriggerClassName =
  "min-h-5 gap-1 px-[calc(--spacing(2)-1px)] text-[10px]";
