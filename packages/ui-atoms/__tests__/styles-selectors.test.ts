import { describe, expect, it } from "vitest";
import { compileCss, declarationsFor } from "./helpers/compile-css.js";

const DEFAULT = '@import "./styles.css";';
const CORE = '@import "./styles/core.css";';
const LIGHT = ':root, [data-theme="light"], [data-theme="system-light"]';
/** Selector whitespace follows how the source happens to be formatted; ignore it. */
const squash = (css: string) => css.replace(/\s+/g, "");
const DARK = '[data-theme="dark"], [data-theme="system-dark"]';

describe("stylesheet selectors", () => {
  it("styles.css gives :root the light tokens and [data-theme=dark] the dark ones", async () => {
    const out = await compileCss(DEFAULT);
    expect(declarationsFor(out, LIGHT)["--background"]).toBe("oklch(1 0 0)");
    expect(declarationsFor(out, DARK)["--background"]).toBe("oklch(0.145 0 0)");
  });
  it("styles.css follows the system preference for data-theme=system", async () => {
    const out = await compileCss(DEFAULT);
    expect(out).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*{\s*\[data-theme="system"\]\s*{[^}]*--background: oklch\(0\.145 0 0\)/,
    );
  });
  it("dark: matches dark and system-dark, on the element and inside it", async () => {
    const out = await compileCss(DEFAULT, ["dark:block"]);
    expect(squash(out)).toContain(
      '.dark\\:block:where([data-theme="dark"],[data-theme="dark"]*,[data-theme="system-dark"],[data-theme="system-dark"]*){display:block;}',
    );
  });
  it("dark: follows the system preference under data-theme=system", async () => {
    const out = await compileCss(DEFAULT, ["dark:block"]);
    expect(squash(out)).toContain(
      '@media(prefers-color-scheme:dark){.dark\\:block:where([data-theme="system"],[data-theme="system"]*){display:block;}}',
    );
  });
  it("core.css applies no tokens to any selector on its own", async () => {
    const out = await compileCss(CORE);
    expect(out).not.toContain("--background: oklch(0.145 0 0)");
    expect(out).not.toContain("--background: oklch(1 0 0)");
  });
  it("a consumer can theme with a class of their own", async () => {
    const out = await compileCss(
      `${CORE}
@custom-variant dark (&:where(.dark, .dark *));
:root { @apply theme-tilli-light; }
.dark { @apply theme-tilli-dark; }`,
      ["dark:block"],
    );
    expect(declarationsFor(out, ".dark")["--background"]).toBe(
      "oklch(0.145 0 0)",
    );
    expect(out).toContain(".dark\\:block:where(.dark, .dark *)");
    expect(out).not.toContain("data-theme");
  });
  it("a token utility scopes a subtree when used as a class", async () => {
    const out = await compileCss(CORE, ["theme-tilli-dark"]);
    expect(declarationsFor(out, ".theme-tilli-dark")["--foreground"]).toBe(
      "oklch(0.985 0 0)",
    );
  });
  it("high contrast raises three tokens and nothing else", async () => {
    const out = await compileCss(CORE, [
      "theme-tilli-contrast-light",
      "theme-tilli-contrast-dark",
      "theme-tilli-light",
      "theme-tilli-dark",
    ]);
    const light = declarationsFor(out, ".theme-tilli-light");
    const dark = declarationsFor(out, ".theme-tilli-dark");
    const hcLight = declarationsFor(out, ".theme-tilli-contrast-light");
    const hcDark = declarationsFor(out, ".theme-tilli-contrast-dark");
    expect(light["--foreground"]).toBeDefined();
    expect(Object.keys(hcLight).sort()).toEqual([
      "--border",
      "--input",
      "--muted-foreground",
    ]);
    expect(hcLight).toEqual({
      "--muted-foreground": light["--foreground"],
      "--border": light["--muted-foreground"],
      "--input": light["--muted-foreground"],
    });
    expect(hcDark).toEqual({
      "--muted-foreground": dark["--foreground"],
      "--border": dark["--muted-foreground"],
      "--input": dark["--muted-foreground"],
    });
  });
  it("styles.css applies the light set for high and system-high", async () => {
    const out = await compileCss(DEFAULT);
    const hc = declarationsFor(
      out,
      ':is([data-contrast="high"], [data-contrast="system-high"]), :is([data-contrast="high"], [data-contrast="system-high"]) :is([data-theme="light"], [data-theme="system-light"])',
    );
    expect(hc["--muted-foreground"]).toBe("oklch(0.145 0 0)");
  });
  it("styles.css applies the dark set in a dark scope, and an element with both attributes follows its own theme", async () => {
    // The cascade itself (which rule wins in which nesting) is asserted in a browser by the
    // Components/ThemeScopes story; this pins the selectors that story depends on.
    const out = await compileCss(DEFAULT);
    const D = ':is([data-theme="dark"], [data-theme="system-dark"])';
    const L = ':is([data-theme="light"], [data-theme="system-light"])';
    const H = ':is([data-contrast="high"], [data-contrast="system-high"])';
    const dark = "oklch(0.985 0 0)";
    const light = "oklch(0.145 0 0)";
    const muted = (selector: string) =>
      declarationsFor(out, selector)["--muted-foreground"];
    expect(muted(`${D} ${H}, ${H} ${D}`)).toBe(dark);
    expect(muted(`${D} ${L} ${H}`)).toBe(light);
    expect(muted(`[data-theme]${L}${H}`)).toBe(light);
    expect(muted(`[data-theme]${D}${H}`)).toBe(dark);
  });
  it("styles.css follows prefers-contrast for data-contrast=system", async () => {
    const out = squash(await compileCss(DEFAULT));
    expect(out).toContain(
      '@media(prefers-contrast:more){[data-contrast="system"],[data-contrast="system"]:is([data-theme="light"],[data-theme="system-light"]){--muted-foreground:',
    );
    expect(out).toContain(
      "@media(prefers-color-scheme:dark)and(prefers-contrast:more){",
    );
  });
  it("high-contrast: is a variant, for high, system-high, and system under the media query", async () => {
    const out = squash(await compileCss(DEFAULT, ["high-contrast:underline"]));
    expect(out).toContain(
      '.high-contrast\\:underline:where([data-contrast="high"],[data-contrast="high"]*,[data-contrast="system-high"],[data-contrast="system-high"]*){text-decoration-line:underline;}',
    );
    expect(out).toContain(
      '@media(prefers-contrast:more){.high-contrast\\:underline:where([data-contrast="system"],[data-contrast="system"]*){text-decoration-line:underline;}}',
    );
  });
});
