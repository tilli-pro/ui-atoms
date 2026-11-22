import { describe, expect, it } from "vitest";
import { compileCss, declarationsFor } from "./helpers/compile-css.js";
import {
  contrast,
  inSrgb,
  type Oklch,
  parseStandardOklch,
  toHex,
} from "./helpers/oklch.js";

const CORE = '@import "./styles/core.css";';
const SETS = [
  "theme-neutral-light",
  "theme-neutral-dark",
  "theme-neutral-contrast-light",
  "theme-neutral-contrast-dark",
];

const compiled = compileCss(CORE, SETS);
const set = async (name: string) => declarationsFor(await compiled, `.${name}`);
const color = (declarations: Record<string, string>, token: string): Oklch => {
  const parsed = parseStandardOklch(declarations[token] ?? "");
  if (!parsed) throw new Error(`${token}: ${declarations[token]}`);
  return parsed;
};

describe("colour standard", () => {
  it.each(SETS)(
    "%s: every value is oklch(L C H) at 4/4/2 decimals and inside sRGB",
    async (name) => {
      const declarations = await set(name);
      expect(Object.keys(declarations).length).toBeGreaterThan(2);
      for (const [token, value] of Object.entries(declarations)) {
        const parsed = parseStandardOklch(value);
        expect(
          parsed,
          `${token}: ${value} is not in the standard form`,
        ).toBeDefined();
        // Outside sRGB a hex can only approximate the colour; the standard is that hex is exact.
        expect(
          inSrgb(parsed as Oklch),
          `${token}: ${value} is outside sRGB`,
        ).toBe(true);
      }
    },
  );
});

describe("brand tokens", () => {
  it("every theme carries the three brand tokens, mapped to Tailwind colours", async () => {
    for (const name of ["theme-neutral-light", "theme-neutral-dark"]) {
      const declarations = await set(name);
      expect(toHex(color(declarations, "--brand")), name).toBe("#325ef6");
      expect(toHex(color(declarations, "--brand-illustration")), name).toBe(
        "#02b1ff",
      );
      expect(declarations["--brand-foreground"], name).toBeDefined();
    }
    const out = await compileCss(CORE, [
      "bg-brand",
      "text-brand-foreground",
      "fill-brand-illustration",
    ]);
    expect(out).toContain("background-color: var(--brand)");
    expect(out).toContain("color: var(--brand-foreground)");
    expect(out).toContain("fill: var(--brand-illustration)");
  });
  it("the brand fill carries white text, and brand text reads on every surface, in both modes", async () => {
    const white: Oklch = { l: 1, c: 0, h: 0 };
    for (const name of ["theme-neutral-light", "theme-neutral-dark"]) {
      const t = await set(name);
      expect(
        contrast(white, color(t, "--brand")),
        `${name} white on brand`,
      ).toBeGreaterThanOrEqual(4.5);
      // The fill is a control: 3:1 against what surrounds it.
      expect(
        contrast(color(t, "--brand"), color(t, "--background")),
        `${name} brand vs page`,
      ).toBeGreaterThanOrEqual(3);
      for (const surface of ["--background", "--card", "--popover"])
        expect(
          contrast(color(t, "--brand-foreground"), color(t, surface)),
          `${name} brand text on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
