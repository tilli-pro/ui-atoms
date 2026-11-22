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
});
