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

/** Empty today: the sidebar was moved here in 2026-11 and moved back to the coss base the
 *  same day (coss serves its own Base UI sidebar). The tooling stays so a shadcn-only
 *  component can be pinned the moment one is wanted: add it here, run `pnpm fetch-shadcn
 *  --update`, and give its coss `COMPONENTS` entry `source: "shadcn"`. */
export const SHADCN_COMPONENTS: readonly ShadcnComponentEntry[] = [];

/** The divergences that stay live under re-basing, and why. Mirrors `LIVE_IDS` in the
 *  coss manifest. Empty while SHADCN_COMPONENTS is. */
export const SHADCN_LIVE_IDS: Readonly<
  Record<string, { resolution: string; why: string }>
> = {};
