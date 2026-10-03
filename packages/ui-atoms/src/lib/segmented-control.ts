import { cva } from "cva";

// coss registry item `registry/default/lib/segmented-control.ts` @8163481,
// copied from `.coss-base/lib/segmented-control.ts` (TAB-2). This is a cva lib,
// not a component — it is unrelated to the tilli-only `segmented-control`
// component under `src/components/`. Two changes from the registry source, and
// `.coss-base/lib/segmented-control.ts` stays the verbatim, digest-pinned
// record of what this was derived from:
//
//  1. The house cva rule: the import moves to `cva` and the legacy
//     two-arg call becomes the beta object form.
//  2. **The size-ramp hold-back** (see `__tests__/size-ramp-holdback.test.ts`).
//     `tabs` is the only consumer of this file and is one of the
//     fourteen components the hold-back names, so every responsive size pair is
//     collapsed to its `sm:` member here rather than being pasted onto every
//     `TabsTab` with the ramp intact: `h-8.5 … sm:h-7.5` → `h-7.5`,
//     `h-9.5 … sm:h-8.5` → `h-8.5`, `h-7.5 … sm:h-6.5` → `h-6.5`,
//     `size-4.5 … sm:size-4` → `size-4`, `text-base … sm:text-sm` → `text-sm`.
//     TAB-2's "the four exported strings/records are verbatim" and the
//     hold-back pull opposite ways for `tabs`; the hold-back is the global
//     rule and adopting the touch bump is a design sign-off, so it wins
//     and the deviation is recorded here. Restoring the ramp is a one-file
//     revert back to the `.coss-base/` bytes.

export type SegmentedControlSize = "default" | "lg" | "sm";

export const segmentedControlItemSizeClassNames: Record<
  SegmentedControlSize,
  string
> = {
  default: "h-7.5 px-[calc(--spacing(2.5)-1px)]",
  lg: "h-8.5 px-[calc(--spacing(3)-1px)]",
  sm: "h-6.5 px-[calc(--spacing(2)-1px)]",
};

export const segmentedControlRootClassName =
  "relative z-0 flex w-fit items-center justify-center gap-0.5 rounded-lg bg-muted p-0.5";

export const segmentedControlItemLayoutClassName =
  "gap-1.5 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0";

export const segmentedControlItemVariants = cva({
  base: [
    "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium text-sm text-muted-foreground/72 outline-2 outline-transparent transition-[outline-color] hover:bg-transparent hover:text-muted-foreground focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-64 data-disabled:pointer-events-none data-disabled:opacity-64",
    segmentedControlItemLayoutClassName,
  ],
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: segmentedControlItemSizeClassNames,
    state: {
      checked:
        "data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm/5 dark:data-checked:bg-input",
      current:
        "aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm/5 dark:aria-[current=page]:bg-input",
      pressed:
        "data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm/5 dark:data-pressed:bg-input",
    },
  },
});
