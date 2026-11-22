import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  compileCss,
  declarationsFor,
} from "../../ui-atoms/__tests__/helpers/compile-css.js";
import {
  contrast,
  inSrgb,
  type Oklch,
  parseStandardOklch,
  toHex,
} from "../../ui-atoms/__tests__/helpers/oklch.js";

const SRC = join(import.meta.dirname, "..", "src");
const UI_ATOMS = join(import.meta.dirname, "..", "..", "ui-atoms", "src");
// Token files are compiled against ui-atoms' source sheet, so these tests need no build.
const SHEET = `@import "../../ui-atoms/src/styles/core.css";
@import "./tilli/tokens.css";
@import "./beacon/tokens.css";`;
const SETS = [
  "theme-neutral-light",
  "theme-neutral-dark",
  "theme-tilli-light",
  "theme-tilli-dark",
  "theme-tilli-contrast-light",
  "theme-tilli-contrast-dark",
  "theme-beacon-light",
  "theme-beacon-dark",
  "theme-beacon-contrast-light",
  "theme-beacon-contrast-dark",
];

const compiled = compileCss(SHEET, SETS, { base: SRC });
const set = async (name: string) => declarationsFor(await compiled, `.${name}`);
const color = (declarations: Record<string, string>, token: string): Oklch => {
  const parsed = parseStandardOklch(declarations[token] ?? "");
  if (!parsed) throw new Error(`${token}: ${declarations[token]}`);
  return parsed;
};
const apart = (a: number, b: number) =>
  Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

/** Each spectrum colour's name, and the hue range that name is allowed to mean. */
const SPECTRUM: [name: string, from: number, to: number][] = [
  ["violet", 280, 320],
  ["pink", 330, 15],
  ["orange", 30, 60],
  ["yellow", 80, 105],
  ["green", 135, 165],
  ["cyan", 195, 225],
];
const within = (hue: number, from: number, to: number) =>
  from <= to ? hue >= from && hue <= to : hue >= from || hue <= to;
const spectrumKeys = SPECTRUM.flatMap(([name]) => [
  `--spectrum-${name}`,
  `--spectrum-${name}-to`,
  `--spectrum-${name}-contrast`,
  `--spectrum-${name}-foreground`,
]);

describe("colour standard", () => {
  it.each(SETS.filter((name) => !name.includes("neutral")))(
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
        expect(
          inSrgb(parsed as Oklch),
          `${token}: ${value} is outside sRGB`,
        ).toBe(true);
      }
    },
  );
});

describe("tilli theme", () => {
  it("declares exactly the tokens ui-atoms' neutral theme does", async () => {
    const neutral = Object.keys(await set("theme-neutral-light")).sort();
    expect(Object.keys(await set("theme-tilli-light")).sort()).toEqual(neutral);
    expect(Object.keys(await set("theme-tilli-dark")).sort()).toEqual(neutral);
  });
  it("is the colour guide's palette", async () => {
    const light = await set("theme-tilli-light");
    const dark = await set("theme-tilli-dark");
    expect(light["--background"]).toBe("oklch(0.985 0.004 258)");
    expect(light["--card"]).toBe("oklch(1 0 0)");
    expect(light["--foreground"]).toBe("oklch(0.145 0.012 258)");
    expect(light["--primary"]).toBe("oklch(0.19 0.014 258)");
    expect(light["--brand"]).toBe("oklch(0.5502 0.2319 266.12)");
    expect(toHex(color(light, "--brand"))).toBe("#325ef6");
    expect(light["--info"]).toBe(light["--brand"]);
    expect(light["--ring"]).toBe(light["--brand"]);
    expect(dark["--background"]).toBe("oklch(0.145 0.012 258)");
    expect(dark["--card"]).toBe("oklch(0.19 0.014 258)");
    expect(dark["--brand-foreground"]).toBe("oklch(0.68 0.166 266.12)");
    expect(dark["--brand-illustration"]).toBe("oklch(0.7232 0.1623 238.87)");
  });
  it.each(["theme-tilli-light", "theme-tilli-dark"])(
    "%s: text reads on its surfaces",
    async (name) => {
      const t = await set(name);
      const pairs: [string, string][] = [
        ["--foreground", "--background"],
        ["--card-foreground", "--card"],
        ["--popover-foreground", "--popover"],
        ["--muted-foreground", "--background"],
        ["--muted-foreground", "--card"],
        ["--muted-foreground", "--muted"],
        ["--primary-foreground", "--primary"],
        ["--secondary-foreground", "--secondary"],
        ["--accent-foreground", "--accent"],
        ["--sidebar-foreground", "--sidebar"],
        ["--sidebar-primary-foreground", "--sidebar-primary"],
        ["--sidebar-accent-foreground", "--sidebar-accent"],
        ["--brand-foreground", "--background"],
        ["--brand-foreground", "--card"],
        ["--info-foreground", "--background"],
        ["--info-foreground", "--card"],
        ["--destructive-foreground", "--background"],
        ["--destructive-foreground", "--card"],
        ["--success-foreground", "--background"],
        ["--success-foreground", "--card"],
        ["--warning-foreground", "--background"],
        ["--warning-foreground", "--card"],
      ];
      for (const [text, surface] of pairs)
        expect(
          contrast(color(t, text), color(t, surface)),
          `${text} on ${surface}`,
        ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast({ l: 1, c: 0, h: 0 }, color(t, "--brand")),
        "white on brand",
      ).toBeGreaterThanOrEqual(4.5);
      // The focus ring is a control edge.
      expect(
        contrast(color(t, "--ring"), color(t, "--background")),
        "ring",
      ).toBeGreaterThanOrEqual(3);
    },
  );
});

describe("beacon theme", () => {
  it.each(["light", "dark"])(
    "%s: is the tilli theme plus the six spectrum colours",
    async (mode) => {
      const beacon = await set(`theme-beacon-${mode}`);
      const tilli = await set(`theme-tilli-${mode}`);
      expect(Object.keys(beacon).sort()).toEqual(
        [...Object.keys(tilli), ...spectrumKeys].sort(),
      );
      for (const [token, value] of Object.entries(tilli))
        expect(beacon[token], token).toBe(value);
    },
  );
  it.each(["light", "dark"])(
    "%s: each spectrum colour carries its contrast colour across the whole gradient, and has readable text",
    async (mode) => {
      const t = await set(`theme-beacon-${mode}`);
      for (const [name] of SPECTRUM) {
        const on = color(t, `--spectrum-${name}-contrast`);
        expect(
          contrast(on, color(t, `--spectrum-${name}`)),
          `${name} fill`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrast(on, color(t, `--spectrum-${name}-to`)),
          `${name} gradient end`,
        ).toBeGreaterThanOrEqual(4.5);
        for (const surface of [
          "--background",
          "--card",
          "--popover",
          "--sidebar",
        ])
          expect(
            contrast(
              color(t, `--spectrum-${name}-foreground`),
              color(t, surface),
            ),
            `${name} text on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
  it("each name means its colour: the fill and its text stay inside that name's hue range", async () => {
    // A token called "pink" that drifted to red would lie at every call site.
    for (const mode of ["light", "dark"]) {
      const t = await set(`theme-beacon-${mode}`);
      for (const [name, from, to] of SPECTRUM)
        for (const key of [
          `--spectrum-${name}`,
          `--spectrum-${name}-foreground`,
        ]) {
          const hue = color(t, key).h;
          expect(
            within(hue, from, to),
            `${mode} ${key} hue ${hue} not in ${from}..${to}`,
          ).toBe(true);
        }
    }
  });
  it("keeps every hue apart from its neighbours and clear of the brand blue", async () => {
    const t = await set("theme-beacon-light");
    const brand = color(t, "--brand").h;
    const hues = SPECTRUM.map(([name]) => color(t, `--spectrum-${name}`).h);
    for (const [name] of SPECTRUM)
      for (const key of [`--spectrum-${name}`, `--spectrum-${name}-to`])
        expect(
          apart(color(t, key).h, brand),
          `${key} vs brand`,
        ).toBeGreaterThanOrEqual(35);
    for (let i = 0; i < hues.length; i++)
      for (let j = i + 1; j < hues.length; j++)
        expect(
          apart(hues[i] ?? 0, hues[j] ?? 0),
          `${SPECTRUM[i]?.[0]} vs ${SPECTRUM[j]?.[0]}`,
        ).toBeGreaterThanOrEqual(40);
  });
  it("maps the spectrum to Tailwind colours", async () => {
    const out = await compileCss(
      SHEET,
      ["bg-spectrum-violet", "text-spectrum-yellow-foreground"],
      { base: SRC },
    );
    expect(out).toContain("background-color: var(--spectrum-violet)");
    expect(out).toContain("color: var(--spectrum-yellow-foreground)");
  });
});

describe.each(["tilli", "beacon"])(
  "%s: high contrast and entry point",
  (theme) => {
    it("high contrast follows ui-atoms' rule", async () => {
      for (const mode of ["light", "dark"]) {
        const tokens = await set(`theme-${theme}-${mode}`);
        expect(await set(`theme-${theme}-contrast-${mode}`)).toEqual({
          "--muted-foreground": tokens["--foreground"],
          "--border": tokens["--muted-foreground"],
          "--input": tokens["--muted-foreground"],
        });
      }
    });
    it("its stylesheet is ui-atoms' styles.css wiring with this theme's token sets", () => {
      const wiring = (css: string) => css.slice(css.indexOf("\n:root,"));
      const neutral = readFileSync(join(UI_ATOMS, "styles.css"), "utf8");
      const entry = readFileSync(join(SRC, `${theme}.css`), "utf8");
      expect(entry).toMatch(
        /^@import "@tilli\.dev\/ui-atoms\/styles\/core\.css";\n@import "\.\/\w+\/tokens\.css";/,
      );
      expect(entry).toContain(`@import "./${theme}/tokens.css";`);
      expect(wiring(entry)).toBe(
        wiring(neutral).replaceAll("theme-neutral-", `theme-${theme}-`),
      );
    });
    it("compiles through the published ui-atoms entry point", async () => {
      const out = await compileCss(`@import "./${theme}.css";`, [], {
        base: SRC,
      });
      expect(
        declarationsFor(
          out,
          ':root, [data-theme="light"], [data-theme="system-light"]',
        )["--background"],
      ).toBe("oklch(0.985 0.004 258)");
      expect(
        declarationsFor(out, '[data-theme="dark"], [data-theme="system-dark"]')[
          "--background"
        ],
      ).toBe("oklch(0.145 0.012 258)");
    });
  },
);
