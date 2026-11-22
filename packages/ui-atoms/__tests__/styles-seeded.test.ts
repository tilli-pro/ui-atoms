import { describe, expect, it } from "vitest";
import { compileCss, declarationsFor } from "./helpers/compile-css.js";

const CORE = '@import "./styles/core.css";';
const LIGHT = ':root, [data-theme="light"], [data-theme="system-light"]';
const DARK = '[data-theme="dark"], [data-theme="system-dark"]';
const VAR = /var\((--[a-z0-9-]+)/g;
const ALLOWED = /^--(seed-(primary|background)|theme-(light|dark))$/;
const PERCENT_IN_LIGHT_DARK = /light-dark\(\s*[\d.]+%/;
const MODE_LIGHT =
  /\.theme-mode-light\s*{\s*--theme-light: initial;\s*--theme-dark: ;\s*color-scheme: light;/;
const MODE_DARK =
  /\.theme-mode-dark\s*{\s*--theme-light: ;\s*--theme-dark: initial;\s*color-scheme: dark;/;
const EMPTY_TOGGLE = /--theme-light: ?;/;
const INITIAL_TOGGLE = /--theme-dark: ?initial/;

describe("seeded themes", () => {
  it("the mode utilities are a pair of opposite toggles plus color-scheme", async () => {
    const out = await compileCss(CORE, ["theme-mode-light", "theme-mode-dark"]);
    expect(out).toMatch(MODE_LIGHT);
    expect(out).toMatch(MODE_DARK);
  });
  it("theme-seeded declares every colour token the default theme does, and no other", async () => {
    const out = await compileCss(CORE, ["theme-seeded", "theme-neutral-light"]);
    const seeded = Object.keys(declarationsFor(out, ".theme-seeded"));
    expect(seeded.length).toBeGreaterThan(30);
    expect(seeded.sort()).toEqual(
      Object.keys(declarationsFor(out, ".theme-neutral-light")).sort(),
    );
  });
  it("every derived token reads only the seeds and the toggles", async () => {
    // Reading another token would work, but only on the element that declares it; reading
    // the seeds directly keeps every formula independent of declaration order.
    const out = await compileCss(CORE, ["theme-seeded"]);
    const seeded = declarationsFor(out, ".theme-seeded");
    for (const [token, value] of Object.entries(seeded))
      for (const [, name] of value.matchAll(VAR))
        expect(name, token).toMatch(ALLOWED);
    expect(seeded["--card"]).toBe(
      "color-mix(in oklch, var(--seed-background) var(--theme-light, 97%) var(--theme-dark, 96%), var(--seed-primary))",
    );
    expect(seeded["--background"]).toBe("var(--seed-background)");
    expect(seeded["--primary"]).toBe("var(--seed-primary)");
    expect(seeded["--border"]).toBe(
      "color-mix(in oklch, var(--seed-primary) var(--theme-light, 12%) var(--theme-dark, 10%), transparent)",
    );
  });
  it("keeps the default theme's status and chart colours, per mode", async () => {
    const out = await compileCss(CORE, [
      "theme-seeded",
      "theme-neutral-light",
      "theme-neutral-dark",
    ]);
    const seeded = declarationsFor(out, ".theme-seeded");
    const light = declarationsFor(out, ".theme-neutral-light");
    const dark = declarationsFor(out, ".theme-neutral-dark");
    for (const token of [
      "--destructive",
      "--destructive-foreground",
      "--chart-1",
      "--chart-5",
      "--info",
      "--info-foreground",
      "--success-foreground",
      "--warning-foreground",
    ])
      expect(seeded[token], token).toBe(
        `var(--theme-light, ${light[token]}) var(--theme-dark, ${dark[token]})`,
      );
  });
  it("never uses light-dark() for a non-colour, which browsers reject", async () => {
    const out = await compileCss(CORE, ["theme-seeded"]);
    expect(out).not.toMatch(PERCENT_IN_LIGHT_DARK);
  });
  it("the toggles survive the production optimiser with their empty values", async () => {
    const out = await compileCss(CORE, ["theme-mode-dark"], { optimize: true });
    expect(out).toMatch(EMPTY_TOGGLE);
    expect(out).toMatch(INITIAL_TOGGLE);
  });
  it("styles.css sets the mode toggles wherever it sets the tokens", async () => {
    const out = await compileCss('@import "./styles.css";');
    expect(declarationsFor(out, LIGHT)["--theme-light"]).toBe("initial");
    expect(declarationsFor(out, LIGHT)["--theme-dark"]).toBe("");
    expect(declarationsFor(out, DARK)["--theme-dark"]).toBe("initial");
    expect(declarationsFor(out, DARK)["--theme-light"]).toBe("");
    expect(declarationsFor(out, '[data-theme="system"]')["--theme-dark"]).toBe(
      "initial",
    );
  });
  it("styles.css changes no token value by gaining the toggles", async () => {
    const out = await compileCss('@import "./styles.css";', [
      "theme-neutral-light",
      "theme-neutral-dark",
    ]);
    const {
      "--theme-light": _l,
      "--theme-dark": _d,
      ...light
    } = declarationsFor(out, LIGHT);
    const {
      "--theme-light": _l2,
      "--theme-dark": _d2,
      ...dark
    } = declarationsFor(out, DARK);
    expect(light).toEqual(declarationsFor(out, ".theme-neutral-light"));
    expect(dark).toEqual(declarationsFor(out, ".theme-neutral-dark"));
  });
});
