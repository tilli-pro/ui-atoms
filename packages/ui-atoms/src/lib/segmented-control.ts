// The strings `tabs` shares with coss's segmented control (TAB-2), derived from
// `.coss-base/segmented-control.tsx` @b2336c4. Upstream this was a cva lib
// (`registry/default/lib/segmented-control.ts` @b2336c4) and is now the
// `SegmentedControl` component's own file; `tabs` still imports only these four
// exports from it. They stay here, in a lib, so `tabs` does not import our
// unrelated `segmented-control` component under `src/components/`. The root
// class string and the item cva of the old lib had no consumer and went with it.
//
// Two changes from the base. The first — **the size-ramp hold-back** (see
// `__tests__/size-ramp-holdback.test.ts`). `tabs` is the only consumer of this
// file and is one of the fourteen components the hold-back names, so every
// responsive size pair is collapsed to its `sm:` member here rather than being
// pasted onto every `TabsTab` with the ramp intact: `h-8.5 … sm:h-7.5` →
// `h-7.5`, `h-9.5 … sm:h-8.5` → `h-8.5`, `h-7.5 … sm:h-6.5` → `h-6.5`,
// `size-4.5 … sm:size-4` → `size-4`. TAB-2's "the exported strings/records are
// verbatim" and the hold-back pull opposite ways for `tabs`; the hold-back is
// the global rule and adopting the touch bump is a design sign-off, so it wins
// and the deviation is recorded here. Restoring the ramp means copying the two
// records back from the `.coss-base/` bytes.

export type SegmentedControlSize = "default" | "lg" | "sm";

export const segmentedControlItemSizeClassNames: Record<
  SegmentedControlSize,
  string
> = {
  default: "h-7.5 px-[calc(--spacing(2.5)-1px)]",
  lg: "h-8.5 px-[calc(--spacing(3)-1px)]",
  sm: "h-6.5 px-[calc(--spacing(2)-1px)]",
};

export const segmentedControlItemLayoutClassName =
  "gap-1.5 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0";

// Second change from the base: its `dark:bg-input` is dropped. coss's dark
// `--input` (8% white) is lighter than its `--muted` (4% white), so the active
// pill reads as raised; in our token sheet the two are the same colour and the
// pill would vanish into the list. `bg-background` keeps it visible in both
// themes, as it was before `dark:` utilities took effect at all (1.1.0).
export const segmentedControlIndicatorSurfaceClassName =
  "rounded-md bg-background shadow-sm/5";
