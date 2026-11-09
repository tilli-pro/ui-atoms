/**
 * The coss registry revision this package is re-based on. One revision for the whole
 * tree, so "current coss" means one thing. Re-pinned only by `fetch-coss.ts --update`,
 * always in its own commit, always with the resulting diff reviewed.
 *
 * Provenance: `apps/ui/registry/default/{ui,lib}` at github.com/cosscom/ui (the repository
 * was cosscom/coss when this pin was taken; it moved with its history intact, so the commit
 * below still resolves there — `main` has since reorganised into `packages/ui/src/`). The label is
 * not taken on trust: `fetch-coss.ts --update` resolves this commit at that repository and
 * re-reads every file it just fetched from the registry at exactly this revision, and
 * refuses to write `coss-lock.json` unless all 54 are byte-identical — so the revision,
 * the digests, `.coss-base/` and THIRD-PARTY-NOTICES all describe one tree. The lock
 * records when that verification last ran (`revisionVerifiedAt`) and when the bytes were
 * fetched (`fetchedAt`); the values below are the pin itself. `4b1240b` ("chore(ui): update
 * Base UI to 1.8.0", #846, 2026-09-07) is an ancestor, so this base targets
 * @base-ui/react 1.8.0 — the version this package pins (XC-3).
 */
export const COSS = {
  registry: "https://coss.com/ui/r",
  repo: "https://github.com/cosscom/ui",
  revision: "816348154874bbc0be230277c584cc38019b48b1",
  revisionDate: "2026-09-16",
  /** Date the bytes in `.coss-base/` were fetched; `coss-lock.json` is the record. */
  fetchedAt: "2026-09-20",
  /** MIT, via the apps/ui carve-out documented in CONTRIBUTING.md and THIRD-PARTY-NOTICES.md. */
  license: "MIT",
} as const;

/** Where a component's base comes from. `shadcn` entries are pinned by
 *  `scripts/shadcn/manifest.ts` and never fetched from the coss registry. */
export type Source = "coss" | "v2" | "shadcn";

/**
 * What re-porting does to that base.
 *  - take-upstream-wholesale : the base ships as-is, modulo the house styled/primitive/variants triple split
 *  - take-with-token-remap   : as above, plus colour utilities re-pointed at tilli tokens
 *  - merge-selectively       : read both files; the base wins unless an id below says otherwise
 *  - keep-ours               : our file stands; the base is fetched for reference only
 *  - adopt                   : one of the four approved dependency swaps
 *  - measure-first           : coss ships it but it has not been measured against ours —
 *                              stay on v2 until someone diffs `.coss-base/<name>.tsx`
 *  - tilli-only              : no upstream counterpart at all
 */
export type Disposition =
  | "take-upstream-wholesale"
  | "take-with-token-remap"
  | "merge-selectively"
  | "keep-ours"
  | "adopt"
  | "measure-first"
  | "tilli-only";

export interface ComponentEntry {
  /** Directory under `packages/ui-atoms/src/components/`, and the published subpath. */
  readonly name: string;
  /** Which tree the base file comes from. */
  readonly source: Source;
  /** coss registry item name, when it differs from `name` (or when a v2-based component
   *  still wants a reference base fetched for the next refresh). */
  readonly registry?: string;
  /** Per-component override of `COSS.revision`; absent means the tree-wide pin. */
  readonly revision?: string;
  readonly disposition: Disposition;
  /** Divergence ids that stay LIVE for this component. Every id here
   *  has an entry in LIVE_IDS saying what was approved. Ids NOT listed have dissolved:
   *  the base supplies them and they are not re-litigated per component. */
  readonly reapply: readonly string[];
  /** Places WE lead upstream. A wholesale take must not regress these. */
  readonly leads?: readonly string[];
  /** Packages this component's adoption removes from the package and the catalog. */
  readonly drops?: readonly string[];
  /** Set on the three tilli-only divergences that were explicitly approved as deliberate. */
  readonly approvedKeep?: true;
  /** Set when the registry item did not exist at `COSS.revision`: the source path in the
   *  coss repository's default branch. The lock then carries `provenance` for it and the
   *  digest alone is the pin (see fetch-coss.ts). */
  readonly postPin?: string;
  /** Set when the registry item is a kit of many files (`chat`) rather than one
   *  `registry:ui` file: every served file is locked, under the key
   *  `<name>/<path inside the item, without extension>`, and written to
   *  `.coss-base/<name>/<path inside the item>`. With `postPin`, `postPin` names the
   *  item's source directory and each file's provenance is `<postPin>/<path inside the item>`. */
  readonly multiFile?: true;
  /** Re-port order: the batch this component was re-ported in. 11 = the 2026-11 additions. */
  readonly task: 5 | 6 | 7 | 8 | 9 | 10 | 11;
  readonly note?: string;
}

const coss = (
  name: string,
  disposition: Disposition,
  task: ComponentEntry["task"],
  rest: Partial<ComponentEntry> = {},
): ComponentEntry => ({
  name,
  source: "coss",
  disposition,
  reapply: [],
  task,
  ...rest,
});

const v2 = (
  name: string,
  disposition: Disposition,
  task: ComponentEntry["task"],
  rest: Partial<ComponentEntry> = {},
): ComponentEntry => ({
  name,
  source: "v2",
  disposition,
  reapply: [],
  task,
  ...rest,
});

/** 67 components, alphabetical. 53 re-based on coss, 14 still on v2, none sourced from shadcn/ui today. */
export const COMPONENTS: readonly ComponentEntry[] = [
  coss("accordion", "merge-selectively", 10, {
    reapply: ["ACC-2"],
    leads: ["headingLevel on AccordionTrigger"],
  }),
  coss("alert", "merge-selectively", 10),
  coss("alert-dialog", "take-with-token-remap", 10),
  v2("aspect-ratio", "tilli-only", 10, {
    reapply: ["ASP-1"],
    note: "re-authored Radix-free on useRender (this package forbids vendored Radix)",
  }),
  coss("autocomplete", "merge-selectively", 10, {
    note: "unblocked by the 1.8.0 pin; sequence after scroll-area and input",
  }),
  coss("avatar", "take-upstream-wholesale", 10),
  coss("badge", "take-with-token-remap", 10),
  coss("breadcrumb", "keep-ours", 10, {
    reapply: ["BRD-1"],
    leads: ["the a06749b02 separator role=presentation removal"],
  }),
  coss("button", "merge-selectively", 5, {
    reapply: ["BTN-3"],
    note: "sequence after spinner",
  }),
  coss("calendar", "adopt", 10, {
    reapply: ["CAL-1", "CAL-2"],
    drops: ["react-aria-components", "@internationalized/date"],
  }),
  coss("card", "merge-selectively", 6, {
    reapply: ["CRD-3"],
    note: "sequence after scroll-area",
  }),
  v2("carousel", "tilli-only", 10, { reapply: ["CAR-1"], approvedKeep: true }),
  coss("chat", "take-upstream-wholesale", 11, {
    postPin: "packages/ui/src/chat",
    multiFile: true,
    note: "added to coss after the pin (first served 2026-11). A composite kit rather than an atom — messages and bubbles, reactions, reply previews, the typing indicator, member lists, empty/loading states and the scroll controller — served as 23 files (20 parts, two hooks, one lib) that are all locked and taken wholesale with imports rewritten, keeping coss's file-per-part layout under src/components/chat/. Not split into the styled/primitive/variants triple: it carries no cva variants.",
  }),
  coss("checkbox", "take-with-token-remap", 8),
  coss("checkbox-group", "merge-selectively", 10),
  coss("collapsible", "keep-ours", 10, {
    leads: ["cursor-pointer on the trigger"],
  }),
  coss("combobox", "merge-selectively", 10, {
    note: "unblocked by the 1.8.0 pin; sequence after scroll-area and input",
  }),
  coss("command", "adopt", 10, {
    reapply: ["CMD-2"],
    drops: ["cmdk"],
    note: "sequence after autocomplete",
  }),
  coss("composer", "take-upstream-wholesale", 11, {
    postPin: "packages/ui/src/components/composer.tsx",
    note: "added to coss after the pin (first shipped 2026-10); taken wholesale with imports rewritten, together with its libs and hook in COSS_LIBS. Not split into the styled/primitive/variants triple: it carries no cva variants.",
  }),
  coss("context-menu", "take-upstream-wholesale", 10, {
    reapply: ["CTX-1"],
    note: "new: CTX-1 adopted",
  }),
  v2("currency-input", "tilli-only", 10, {
    reapply: ["CUR-1"],
    drops: ["react-currency-input-field"],
    note: "CUR-1 answered: re-authored as a currency preset of number-field (the Base UI root's own `format` + `locale`), which drops the optional peer. Still tilli-only — coss ships no currency component — so there is no base to fetch.",
  }),
  coss("dialog", "merge-selectively", 6, {
    reapply: ["DLG-4"],
    note: "sequence after scroll-area and button",
  }),
  coss("drawer", "adopt", 10, {
    reapply: ["DRW-1"],
    drops: ["vaul"],
    note: "sequence after scroll-area and button",
  }),
  coss("empty", "merge-selectively", 10),
  coss("field", "merge-selectively", 8, {
    reapply: ["FLD-2", "FLD-3", "FLD-5", "FLD-6"],
  }),
  coss("fieldset", "keep-ours", 7, { reapply: ["FST-1"] }),
  coss("form", "take-upstream-wholesale", 8, { reapply: ["FRM-1"] }),
  v2("form-root-error", "tilli-only", 9),
  coss("frame", "merge-selectively", 10, {
    leads: ["the not-has-[table]: panel variants"],
  }),
  coss("group", "merge-selectively", 10),
  coss("input", "merge-selectively", 8, { reapply: ["INP-1", "INP-2"] }),
  coss("input-group", "merge-selectively", 10, {
    note: "sequence after input",
  }),
  coss("kbd", "keep-ours", 10, {
    note: "upstream hardcodes rounded-[.25rem] — a regression",
  }),
  coss("label", "take-with-token-remap", 8, {
    note: "was generic-label; LBL-1 dissolves into the rename",
  }),
  coss("menu", "merge-selectively", 10, { reapply: ["MNU-3"] }),
  coss("meter", "keep-ours", 10),
  v2("number-field", "measure-first", 10, { registry: "number-field" }),
  v2("number-ticker", "tilli-only", 10, {
    reapply: ["NUM-1"],
    approvedKeep: true,
  }),
  coss("otp-field", "adopt", 10, {
    reapply: ["OTP-1"],
    drops: ["input-otp"],
    note: "was input-otp; InputOTP → OTPField, InputOTPSlot → OTPFieldInput, InputOTPSeparator → OTPFieldSeparator, InputOTPGroup deleted",
  }),
  coss("pagination", "merge-selectively", 10),
  coss("popover", "take-with-token-remap", 10),
  coss("preview-card", "take-upstream-wholesale", 10),
  coss("progress", "keep-ours", 10),
  coss("radio-group", "take-upstream-wholesale", 8),
  v2("resizable", "tilli-only", 10, { reapply: ["RSZ-1"], approvedKeep: true }),
  coss("scroll-area", "take-upstream-wholesale", 6, {
    note: "prerequisite of card, dialog, drawer, combobox, autocomplete, command",
  }),
  v2("segmented-control", "tilli-only", 10, {
    note: "coss's segmented-control is a cva lib, not a component — it lands as src/lib/segmented-control.ts for tabs (TAB-2)",
  }),
  coss("select", "merge-selectively", 7),
  coss("separator", "merge-selectively", 5),
  v2("sheet", "measure-first", 10, {
    registry: "sheet",
    note: "unmeasured; check first whether coss still treats sheet and drawer as distinct",
  }),
  coss("sidebar", "merge-selectively", 10, {
    reapply: ["SBR-1", "SBR-2", "SBR-3", "SBR-4", "SBR-5", "SBR-6", "SBR-7"],
    note: "coss's own Base UI sidebar (the registry serves it, undocumented). Measured 2026-11: same skeleton as shadcn's base-nova build, better icon sizing and RTL, ScrollArea content; chosen over shadcn's. The hsl() wrapper on the outline shadow is dropped — our tokens are oklch.",
  }),
  coss("skeleton", "keep-ours", 5, {
    note: "byte-equivalent modulo house style — a no-op",
  }),
  coss("slider", "take-upstream-wholesale", 10),
  coss("spinner", "merge-selectively", 5, {
    leads: ["the size-4 default"],
    note: "re-port before button",
  }),
  v2("spinning-text", "tilli-only", 10),
  v2("stepper", "tilli-only", 10),
  coss("switch", "take-upstream-wholesale", 10),
  coss("table", "merge-selectively", 7, { reapply: ["TBL-2"] }),
  coss("tabs", "merge-selectively", 10, { reapply: ["TAB-2"] }),
  coss("textarea", "take-upstream-wholesale", 10),
  v2("timeline", "tilli-only", 10),
  coss("toast", "merge-selectively", 10, { reapply: ["TST-4"] }),
  coss("toggle", "take-with-token-remap", 10, {
    note: "re-port BEFORE toggle-group",
  }),
  coss("toggle-group", "take-with-token-remap", 10),
  v2("toolbar", "measure-first", 10, { registry: "toolbar" }),
  coss("tooltip", "merge-selectively", 5, { reapply: ["TIP-1", "TIP-3"] }),
  v2("tree", "tilli-only", 10),
];

/** Non-component coss registry items we vendor. Fetched, written to `.coss-base/`
 *  and digest-pinned exactly like the component bases, but they land outside
 *  `src/components/`, so they get their own list rather than a COMPONENTS entry. */
export interface LibEntry {
  /** coss registry item name — fetched from `${COSS.registry}/<registry>.json`. */
  readonly registry: string;
  /** Path under `.coss-base/` the fetched bytes are written to. */
  readonly base: string;
  /** Path under `packages/ui-atoms/src/` the ported file lands at. */
  readonly dest: string;
  /** As on ComponentEntry: source path in the coss repository for an item newer than the pin. */
  readonly postPin?: string;
  readonly task: 10 | 11;
  readonly why: string;
}

export const COSS_LIBS: readonly LibEntry[] = [
  {
    registry: "segmented-control",
    base: "lib/segmented-control.ts",
    dest: "lib/segmented-control.ts",
    task: 10,
    why: "TAB-2 — coss's tabs declares registryDependencies ['@coss/segmented-control'] and imports SegmentedControlSize / segmentedControlItemSizeClassNames / segmentedControlItemLayoutClassName from it. It is a registry:lib, not a component, and is unrelated to our tilli-only segmented-control component.",
  },
  {
    registry: "use-media-query",
    base: "hooks/use-media-query.ts",
    dest: "hooks/use-media-query.ts",
    task: 11,
    why: "sidebar imports useMediaQuery('max-md') from it; it also supplies useIsMobile, replacing the shadcn use-mobile hook.",
  },
  {
    registry: "use-copy-to-clipboard",
    base: "hooks/use-copy-to-clipboard.ts",
    dest: "hooks/use-copy-to-clipboard.ts",
    task: 11,
    why: "the one other registry:hook coss publishes; exported from ./hooks for parity with the registry.",
  },
  {
    registry: "composer-editor",
    base: "lib/composer-editor.ts",
    dest: "lib/composer-editor.ts",
    postPin: "packages/ui/src/lib/composer-editor.ts",
    task: 11,
    why: "composer's editor context and provider; a registry:lib the component re-exports from.",
  },
  {
    registry: "composer-document",
    base: "lib/composer-document.ts",
    dest: "lib/composer-document.ts",
    postPin: "packages/ui/src/lib/composer-document.ts",
    task: 11,
    why: "composer's value model (parts, tokens, text) used by the editor hook.",
  },
  {
    registry: "composer-query",
    base: "lib/composer-query.ts",
    dest: "lib/composer-query.ts",
    postPin: "packages/ui/src/lib/composer-query.ts",
    task: 11,
    why: "composer's trigger-query parser, a dependency of composer-document.",
  },
  {
    registry: "composer-clipboard",
    base: "lib/composer-clipboard.ts",
    dest: "lib/composer-clipboard.ts",
    postPin: "packages/ui/src/lib/composer-clipboard.ts",
    task: 11,
    why: "composer's clipboard (de)serialisation, a dependency of the editor hook.",
  },
  {
    registry: "use-composer-editor",
    base: "hooks/use-composer-editor.ts",
    dest: "hooks/use-composer-editor.ts",
    postPin: "packages/ui/src/hooks/use-composer-editor.ts",
    task: 11,
    why: "composer's contenteditable engine; a registry:hook the editor lib wraps.",
  },
];

export interface LiveId {
  /** What was approved: reset, re-apply, re-author, adopt, drop, keep or deferred. */
  readonly resolution: string;
  readonly why: string;
}

/**
 * The 40 divergence ids that stay LIVE under re-basing, each with the answer the port builds
 * on. The other 68 have DISSOLVED: the base supplies them, and none of them is re-litigated
 * per component.
 *
 * How a live id was resolved: the audit's own recommendation is the answer unless it was
 * overridden, or a wholesale take would regress a place where we lead upstream.
 *   reset     → nothing is re-applied; the base already is coss. The consumer migration is
 *               still real and falls to the consuming application.
 *   re-apply  → edit the base back toward us, exactly this much and no more.
 *   re-author → there is no coss base for this component at all;
 *               we write it fresh on base-ui primitives. ASP-1 only.
 *   adopt / drop / keep / deferred → as written.
 */
export const LIVE_IDS: Readonly<Record<string, LiveId>> = {
  "SBR-1": {
    resolution:
      "re-apply the exported SIDEBAR_WIDTH / SIDEBAR_WIDTH_MOBILE / SIDEBAR_WIDTH_ICON constants, with SIDEBAR_WIDTH = 14rem",
    why: "published API: consumers size layouts from them. 14rem is the house density; the base's 16rem would widen every existing sidebar.",
  },
  "SBR-2": {
    resolution: "re-apply the 7-year cookie lifetime",
    why: "the base's 7 days forgets the user's collapsed state weekly; ours is a persisted preference.",
  },
  "SBR-3": {
    resolution:
      "re-apply the TooltipProvider delay={0} wrapper in SidebarProvider",
    why: "collapsed-rail tooltips are labels for icon-only buttons and should open instantly.",
  },
  "SBR-4": {
    resolution:
      "re-apply the OS-aware rail title (⌘B / Ctrl+B), resolved after mount",
    why: "the shortcut is otherwise undiscoverable; the post-mount resolution avoids a hydration mismatch.",
  },
  "SBR-5": {
    resolution:
      're-apply type="button" as SidebarMenuButton\'s default when render is not set',
    why: "a menu button inside a <form> must not submit it; the base leaves the browser default (submit).",
  },
  "SBR-6": {
    resolution: "re-apply SidebarTriggerMobile",
    why: "published API: a trigger that mounts only on mobile, for headers that already show the rail on desktop.",
  },
  "SBR-7": {
    resolution:
      "re-apply the document.cookie fallback behind a cookieStore feature check",
    why: "the base writes only through the Cookie Store API, which Safari gained in 18.4 and Firefox in 142; a library must not throw on older engines, and a consumer-side polyfill (npm `cookie-store`, last published 2020) is not something to require.",
  },
  "XC-3": {
    resolution: "adopt @base-ui/react 1.8.0",
    why: "bump to the latest 1.x. Verified latest = 1.8.0; coss's pinned revision targets the same line.",
  },
  "BTN-3": {
    resolution: "re-apply the ButtonPrimitive / Button / buttonVariants split",
    why: "the audit recommended collapsing to coss's flat Button, but the triple (styled part, primitive, variants) is required for every previously-forked part and button is forked three ways. This is the one place the port knowingly departs from that recommendation.",
  },
  "TIP-1": {
    resolution:
      "reset — drop withArrow / arrowClassName and the tooltip-arrow slot",
    why: "coss has no tooltip arrow.",
  },
  "TIP-3": {
    resolution: "drop the one-value public variant prop",
    why: "the package is tenant-free, the prop applies no classes, and the downstream tenant fork composes tooltipPopupVariants instead.",
  },
  "CRD-3": {
    resolution: "re-apply the CardContent alias alongside CardPanel",
    why: "shadcn aliases are retired here but coss ships this one; keeping it lets a migration emit CardContent mechanically, so the card-content → card-panel slot rename costs consumers nothing.",
  },
  "TAB-2": {
    resolution:
      "reset — take coss's size prop and the segmented-control size context",
    why: "coss's segmented-control is a cva lib; it lands as src/lib/segmented-control.ts and does not collide with our segmented-control component. Existing lists shift slightly.",
  },
  "INP-1": {
    resolution:
      "reset — className lands on the wrapper, containerClassName is gone",
    why: "Existing `className` tags change meaning with no compiler signal, so each consumer is resolved by hand.",
  },
  "INP-2": {
    resolution: "reset — drop the ghost variant",
    why: "coss's unstyled covers it.",
  },
  "FLD-2": {
    resolution: "reset — FieldError renders children verbatim",
    why: "no auto-rewrite through formatArktypeValidationMessage; ./formatters still exports it for callers who want it.",
  },
  "FLD-3": {
    resolution: "reset — drop FieldError's variant/size",
    why: "copy-paste from form-root-error; coss has neither.",
  },
  "FLD-5": {
    resolution: "reset — drop the centered variant",
    why: 'className="items-center" covers it.',
  },
  "FLD-6": {
    resolution: "reset — take coss's items-start root layout",
    why: "drops the duplicated space-y-2 either way.",
  },
  "FRM-1": {
    resolution: "reset — Form becomes a pure pass-through",
    why: "flex w-full flex-col gap-4 goes away; it was visually load-bearing → consumers that want that layout add it themselves.",
  },
  "FST-1": {
    resolution: "reset — drop the max-w-64 cap",
    why: "it contradicts the component's own w-full; existing tags widen.",
  },
  "DLG-4": {
    resolution:
      "reset — backdropClassName / closeButtonClassName give way to coss's closeProps",
    why: "props we invented.",
  },
  "TBL-2": {
    resolution: "reset — drop wrapperClassName",
    why: "coss's render is strictly more powerful and is the house convention.",
  },
  "BRD-1": {
    resolution:
      "keep our separator without role=presentation, and remove role=presentation from BreadcrumbEllipsis too",
    why: "one attribute, not a pair. The pinned base has role=presentation on BreadcrumbSeparator and ours does not (a06749b02 'fix: ada compliance issues', 2026-09-15). The aria-disabled/role=link NOTE on our BreadcrumbPage documents a shadcn-leftover cleanup coss made independently: the base's BreadcrumbPage carries neither attribute and is otherwise identical to ours, so there is nothing to re-apply there. With only the separator in play the reset recommendation is well founded, and its condition is consistency: 'restore, or remove from both'. We keep the removal and extend it to the ellipsis so the component states one policy. Internal attribute; aria-hidden=true already removes both nodes from the a11y tree, so a plain reset is also safe.",
  },
  "ACC-2": {
    resolution: "re-apply headingLevel on AccordionTrigger",
    why: "coss's wrapper cannot express it — it always renders h3, so a wholesale take reintroduces skipped heading levels.",
  },
  "MNU-3": {
    resolution: "adopt MenuLinkItem",
    why: "was gated on XC-3; 1.8.0 makes it reachable.",
  },
  "TST-4": {
    resolution: "adopt updateKey, and author the four keyframes ourselves",
    why: "was deferred behind XC-3; 1.8.0 makes it reachable. coss keeps the keyframes outside the registry, so this is the one place the pinned base is incomplete — they are written into src/styles.css.",
  },
  "CUR-1": {
    resolution:
      "re-author currency-input on number-field and drop the react-currency-input-field optional peer",
    why: 'a `decide` id the audit rule could not settle: there is no coss currency-input, so this was never fork-vs-upstream but a question about whether a component ships a prop surface that lies — five declared props (`onChange`, `minimum`, `maximum`, `render`, `defaultValue`) were destructured and never used, and the component was self-controlled, so a caller could not drive it. `@base-ui/react/number-field` at the pinned 1.8.0 already formats through `format: Intl.NumberFormatOptions` + `locale`, which is exactly what the wrapper existed for, so a currency field is that root with `style: "currency"` and an ISO 4217 code. Every dead prop maps onto a real one — `onChange` → `onValueChange`, `minimum`/`maximum` → `min`/`max`, `render` → the base\'s own — the mirror state goes, and the optional peer goes with it, leaving five. The component stays tilli-only: it is a preset of our own number-field, not an upstream take.',
  },
  "MSL-1": {
    resolution: "drop multi-select",
    why: "the audit's recommendation; its only implementation is cmdk-backed and cmdk leaves with the command swap. <Combobox multiple> replaces it.",
  },
  "CTX-1": {
    resolution: "adopt coss's context-menu — approved",
    why: 'the audit\'s recommendation is `decide`, not `reset`, and the reset rule ("everything else with no upstream equivalent resets") is about dropping tilli-only code, not importing new upstream components. coss ships it, 1.8.0 has the primitive, 0 consumers, and under re-basing it costs one fetch, so the component is adopted.',
  },
  "ASP-1": {
    resolution: "re-author Radix-free on useRender",
    why: "the audit leans re-author and this package forbids surviving vendored Radix; no coss counterpart exists to take.",
  },
  "RSZ-1": {
    resolution: "keep as an acknowledged tilli-only divergence",
    why: "approved as a deliberate tilli-only divergence.",
  },
  "CAR-1": {
    resolution: "keep as an acknowledged tilli-only divergence",
    why: "approved as a deliberate tilli-only divergence.",
  },
  "NUM-1": {
    resolution: "keep as an acknowledged tilli-only divergence",
    why: "approved as a deliberate tilli-only divergence. The hard-coded en-US locale is a follow-up, not a blocker.",
  },
  "CHT-1": {
    resolution: "drop — chart is not ported and is not part of this package",
    why: "Existing ChartContainer consumers keep their only implementation outside this package.",
  },
  "OTP-1": {
    resolution: "adopt @base-ui/react/otp-field",
    why: "one of the four approved dependency swaps. Drops the input-otp package; InputOTP → OTPField, InputOTPSlot → OTPFieldInput, InputOTPSeparator → OTPFieldSeparator, InputOTPGroup deleted.",
  },
  "CMD-2": {
    resolution: "adopt coss's Autocomplete-backed command",
    why: "one of the four approved dependency swaps. Drops cmdk, and with it multi-select (MSL-1).",
  },
  "DRW-1": {
    resolution: "adopt @base-ui/react/drawer",
    why: "one of the four approved dependency swaps. Drops vaul; DrawerOverlay → DrawerBackdrop and DrawerContent changes meaning.",
  },
  "CAL-1": {
    resolution: "adopt coss's DayPicker calendar",
    why: "one of the four approved dependency swaps. Drops react-aria-components and @internationalized/date, adds @daypicker/react; Calendar + RangeCalendar collapse into one mode-driven Calendar and the value type goes CalendarDate → native Date.",
  },
  "CAL-2": {
    resolution:
      "re-apply the optional time field (`showTime`, `CalendarTime`) on top of coss's calendar",
    why: "no upstream ships a date-and-time component, and the day picker has no time picker of its own. The field follows coss's p-calendar-25 particle (a validated 24-hour autocomplete input) and sits beside the day picker rather than in its `footer` (a polite live region, where a field is announced instead of operated) or its `components` (which only replace the picker's own elements). Built from field and autocomplete on @base-ui/react, so `./calendar` keeps `@daypicker/react` as its only optional peer.",
  },
};
