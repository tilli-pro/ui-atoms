import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The size-ramp hold-back (a repository-wide rule). coss's class
 * strings are mobile-first — taller below `sm:`, shrinking from `sm:` up — and
 * our fixed sizes are exactly coss's `sm:` values. Adopting the ramp is a
 * design sign-off, not a drift cleanup, so when a base class string is copied
 * every responsive pair collapses to its `sm:` member and the prefix is
 * dropped. The rule names these fourteen components and nowhere else.
 *
 * It was previously invisible to CI, which is how `tabs` came to be
 * half-collapsed: its own strings were collapsed while `src/lib/segmented-control.ts`
 * pasted `h-8.5 … sm:h-7.5` and `size-4.5 sm:size-4` onto every `TabsTab`.
 * This test covers the shared lib as well as the fourteen files.
 */
const HOLD_BACK = [
  "components/autocomplete/index.tsx",
  "components/badge/index.tsx",
  "components/button/index.tsx",
  "components/calendar/index.tsx",
  "components/checkbox/index.tsx",
  "components/combobox/index.tsx",
  "components/input/index.tsx",
  "components/menu/index.tsx",
  "components/radio-group/index.tsx",
  "components/select/index.tsx",
  "components/slider/index.tsx",
  "components/switch/index.tsx",
  "components/tabs/index.tsx",
  "components/toggle/index.tsx",
  // Reached only from `tabs` (TAB-2), and therefore bound by the same rule.
  "lib/segmented-control.ts",
];

/**
 * `sm:` breakpoints that are *not* half of a size pair are copied as-is, so
 * each one is allowed by name rather than by pattern.
 */
const LAYOUT_EXCEPTIONS: Record<string, readonly string[]> = {
  // Two calendar months stack below `sm:` and sit side by side above it.
  "components/calendar/index.tsx": ["sm:flex-row"],
};

/** Comments explain the collapse; only code is checked. */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/**
 * A Tailwind variant prefix is `sm:` glued to the utility it modifies. A cva
 * `size` variant *key* is `sm:` followed by whitespace, which is not a class.
 */
const SM_VARIANT = /\bsm:\S+/g;

describe("size-ramp hold-back", () => {
  it.each(HOLD_BACK)("%s carries no `sm:` size pair", (rel) => {
    const text = stripComments(
      readFileSync(join(import.meta.dirname, "..", "src", rel), "utf8"),
    );
    const allowed = LAYOUT_EXCEPTIONS[rel] ?? [];
    const found = [...text.matchAll(SM_VARIANT)]
      .map((m) => m[0].replace(/["'`,\s].*$/, ""))
      .filter((cls) => !allowed.includes(cls));
    expect(found).toEqual([]);
  });

  it("the shared segmented-control records are the `sm:` half of coss's ramp", () => {
    // Exact values, so a re-fetch that re-introduces the ramp fails here and
    // not only in a screenshot: coss's `h-8.5 … sm:h-7.5` collapses to `h-7.5`.
    const lib = readFileSync(
      join(import.meta.dirname, "..", "src", "lib", "segmented-control.ts"),
      "utf8",
    );
    expect(lib).toContain('default: "h-7.5 px-[calc(--spacing(2.5)-1px)]"');
    expect(lib).toContain('lg: "h-8.5 px-[calc(--spacing(3)-1px)]"');
    expect(lib).toContain('sm: "h-6.5 px-[calc(--spacing(2)-1px)]"');
    expect(lib).toContain("[&_svg:not([class*='size-'])]:size-4 ");
  });
});
