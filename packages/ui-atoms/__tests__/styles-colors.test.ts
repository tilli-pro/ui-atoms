import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compileCss, declarationsFor } from "./helpers/compile-css.js";
import {
  contrast,
  inSrgb,
  type Oklch,
  parseStandardOklch,
  toHex,
} from "./helpers/oklch.js";

const SRC = join(import.meta.dirname, "..", "src");
const CORE = '@import "./styles/core.css";';
const SETS = [
  "theme-neutral-light",
  "theme-neutral-dark",
  "theme-neutral-contrast-light",
  "theme-neutral-contrast-dark",
  "theme-tilli-light",
  "theme-tilli-dark",
  "theme-tilli-contrast-light",
  "theme-tilli-contrast-dark",
  "theme-beacon-light",
  "theme-beacon-dark",
  "theme-beacon-contrast-light",
  "theme-beacon-contrast-dark",
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
    for (const name of [
      "theme-neutral-light",
      "theme-neutral-dark",
      "theme-tilli-light",
      "theme-tilli-dark",
    ]) {
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
    for (const name of [
      "theme-neutral-light",
      "theme-neutral-dark",
      "theme-tilli-light",
      "theme-tilli-dark",
    ]) {
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

describe("tilli theme", () => {
  it("declares exactly the tokens the neutral theme does", async () => {
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
    expect(light["--brand-foreground"]).toBe("oklch(0.5502 0.2319 266.12)");
    expect(light["--info"]).toBe(light["--brand"]);
    expect(light["--ring"]).toBe(light["--brand"]);
    expect(dark["--background"]).toBe("oklch(0.145 0.012 258)");
    expect(dark["--card"]).toBe("oklch(0.19 0.014 258)");
    expect(dark["--brand"]).toBe("oklch(0.5502 0.2319 266.12)");
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
      // The focus ring is a control edge.
      expect(
        contrast(color(t, "--ring"), color(t, "--background")),
        "ring",
      ).toBeGreaterThanOrEqual(3);
    },
  );
  it("high contrast follows the same rule as the neutral theme", async () => {
    for (const mode of ["light", "dark"]) {
      const theme = await set(`theme-tilli-${mode}`);
      expect(await set(`theme-tilli-contrast-${mode}`)).toEqual({
        "--muted-foreground": theme["--foreground"],
        "--border": theme["--muted-foreground"],
        "--input": theme["--muted-foreground"],
      });
    }
  });
  it("styles/tilli.css is styles.css with the tilli token sets", () => {
    const normalise = (css: string) => css.slice(css.indexOf("\n:root,"));
    const neutral = readFileSync(join(SRC, "styles.css"), "utf8");
    const tilli = readFileSync(join(SRC, "styles", "tilli.css"), "utf8");
    expect(tilli).toMatch(/^@import "\.\/core\.css";/);
    expect(normalise(tilli)).toBe(
      normalise(neutral).replaceAll("theme-neutral-", "theme-tilli-"),
    );
  });
  it("styles/tilli.css gives :root the tilli light tokens and dark the dark ones", async () => {
    const out = await compileCss('@import "./styles/tilli.css";');
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
});
describe("beacon theme", () => {
  const SPECTRUM = [1, 2, 3, 4, 5, 6];
  const spectrumKeys = SPECTRUM.flatMap((n) => [
    `--spectrum-${n}`,
    `--spectrum-${n}-to`,
    `--spectrum-${n}-contrast`,
    `--spectrum-${n}-foreground`,
  ]);

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
      expect(await set(`theme-beacon-contrast-${mode}`)).toEqual(
        await set(`theme-tilli-contrast-${mode}`),
      );
    },
  );
  it.each(["light", "dark"])(
    "%s: each spectrum colour carries its own contrast colour across the whole gradient, and has readable text",
    async (mode) => {
      const t = await set(`theme-beacon-${mode}`);
      for (const n of SPECTRUM) {
        const on = color(t, `--spectrum-${n}-contrast`);
        expect(
          contrast(on, color(t, `--spectrum-${n}`)),
          `${n} fill`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrast(on, color(t, `--spectrum-${n}-to`)),
          `${n} gradient end`,
        ).toBeGreaterThanOrEqual(4.5);
        for (const surface of ["--background", "--card", "--sidebar"])
          expect(
            contrast(color(t, `--spectrum-${n}-foreground`), color(t, surface)),
            `${n} text on ${surface}`,
          ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );
  it("keeps every spectrum hue apart from its neighbours and out of the brand blue's range", async () => {
    const t = await set("theme-beacon-light");
    const brand = color(t, "--brand").h;
    const apart = (a: number, b: number) =>
      Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
    const hues = SPECTRUM.map((n) => color(t, `--spectrum-${n}`).h);
    for (const n of SPECTRUM) {
      for (const key of [`--spectrum-${n}`, `--spectrum-${n}-to`])
        expect(
          apart(color(t, key).h, brand),
          `${key} vs brand`,
        ).toBeGreaterThanOrEqual(35);
    }
    for (let i = 0; i < hues.length; i++)
      for (let j = i + 1; j < hues.length; j++)
        expect(
          apart(hues[i] ?? 0, hues[j] ?? 0),
          `${i + 1} vs ${j + 1}`,
        ).toBeGreaterThanOrEqual(40);
  });
  it("maps the spectrum to Tailwind colours and ships styles/beacon.css", async () => {
    const out = await compileCss(CORE, [
      "bg-spectrum-1",
      "text-spectrum-4-foreground",
      "to-spectrum-6-to",
    ]);
    expect(out).toContain("background-color: var(--spectrum-1)");
    expect(out).toContain("color: var(--spectrum-4-foreground)");
    const normalise = (css: string) => css.slice(css.indexOf("\n:root,"));
    const neutral = readFileSync(join(SRC, "styles.css"), "utf8");
    const beacon = readFileSync(join(SRC, "styles", "beacon.css"), "utf8");
    expect(beacon).toMatch(/^@import "\.\/core\.css";/);
    expect(normalise(beacon)).toBe(
      normalise(neutral).replaceAll("theme-neutral-", "theme-beacon-"),
    );
  });
});
