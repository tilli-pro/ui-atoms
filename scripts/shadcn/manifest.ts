/**
 * The shadcn/ui registry pin for components that were never coss components.
 *
 * `scripts/coss/manifest.ts` pins the coss registry for the 50 components re-based on it.
 * A component listed here is sourced from shadcn/ui instead: its `COMPONENTS` entry in the
 * coss manifest carries `source: "shadcn"` and no coss `registry`, so `fetch-coss` never
 * writes a `.coss-base/<name>.tsx` for it, and `fetch-shadcn` owns its base under
 * `.shadcn-base/` with `shadcn-lock.json` as the record.
 *
 * Unlike coss, shadcn serves GENERATED files: a style such as `base-nova` is built from a
 * template under `apps/v4/registry/bases/<base>/ui/` (whose class lists are `cn-*`
 * placeholders) plus the style's token set, so no commit of github.com/shadcn-ui/ui contains
 * the served bytes verbatim. The lock pins the served bytes exactly and records the template's
 * last commit as provenance only — see `fetch-shadcn.ts` for what each half proves.
 */
export const SHADCN = {
  /** Style whose registry items are fetched: Base UI primitives, "nova" tokens. */
  style: "base-nova",
  registry: "https://ui.shadcn.com/r/styles/base-nova",
  repo: "https://github.com/shadcn-ui/ui",
  /** Branch the template provenance is resolved on. */
  branch: "main",
  /** MIT — `LICENSE.md` at the repository root, "Copyright (c) 2023 shadcn". */
  license: "MIT",
} as const;

export interface ShadcnComponentEntry {
  /** Directory under `packages/ui-atoms/src/components/`, and the published subpath. */
  readonly name: string;
  /** shadcn registry item name — fetched from `${SHADCN.registry}/<registry>.json`. */
  readonly registry: string;
  /** The template the registry generates the served file from, relative to `apps/v4/`. */
  readonly template: string;
  /** What porting does to the base: as in the coss manifest, minus the coss-only values. */
  readonly disposition:
    | "take-upstream-wholesale"
    | "merge-selectively"
    | "keep-ours";
  /** Deliberate departures from the base that a refresh must re-apply; each id is
   *  described in SHADCN_LIVE_IDS. */
  readonly reapply: readonly string[];
  readonly note?: string;
}

/** The two components that were shadcn/ui's all along and were recorded as tilli-only
 *  until the 2026-11 refresh compared them with the registry. `carousel` is `keep-ours`: its
 *  base is pinned as the record of what it derives from and as the diff a later refresh
 *  starts from. `resizable` was re-ported onto its base when the peer moved to 4.x. (The sidebar was moved here in 2026-11 and
 *  moved back to the coss base the same day: coss serves its own Base UI sidebar.) To add
 *  one: list it here, run `pnpm fetch-shadcn --update`, and give its coss `COMPONENTS`
 *  entry `source: "shadcn"`. */
export const SHADCN_COMPONENTS: readonly ShadcnComponentEntry[] = [
  {
    name: "carousel",
    registry: "carousel",
    template: "registry/bases/base/ui/carousel.tsx",
    disposition: "keep-ours",
    reapply: [],
    note: "ours keeps lucide ArrowLeft / ArrowRight and size-8 buttons (CAR-1 in the coss manifest); the base generates icon placeholders and icon-sm buttons.",
  },
  {
    name: "resizable",
    registry: "resizable",
    template: "registry/bases/base/ui/resizable.tsx",
    disposition: "merge-selectively",
    reapply: [],
    note: "the base's react-resizable-panels 4.x shape and class strings are taken; the styling is ours (RSZ-1 in the coss manifest): a grip handle where the base draws a plain bar, and the coss focus ring and state colours.",
  },
];

/** The divergences that stay live under re-basing, and why. Mirrors `LIVE_IDS` in the
 *  coss manifest. Empty while SHADCN_COMPONENTS is. */
export const SHADCN_LIVE_IDS: Readonly<
  Record<string, { resolution: string; why: string }>
> = {};
