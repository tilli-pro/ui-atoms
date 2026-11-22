import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "src");
// The canonical sheet: everything selector-free lives in core.css.
const css = readFileSync(join(SRC, "styles", "core.css"), "utf8");
// The default wiring: which selectors receive which token utility.
const wiring = readFileSync(join(SRC, "styles.css"), "utf8");

const THEME_KEYS = [
  "--font-header",
  "--font-body",
  "--font-mono",
  "--font-button",
  "--color-background",
  "--color-background-secondary",
  "--color-foreground",
  "--color-card",
  "--color-card-foreground",
  "--color-popover",
  "--color-popover-foreground",
  "--color-primary",
  "--color-primary-foreground",
  "--color-secondary",
  "--color-secondary-foreground",
  "--color-muted",
  "--color-muted-foreground",
  "--color-accent",
  "--color-accent-foreground",
  "--color-destructive",
  "--color-destructive-foreground",
  "--color-border",
  "--color-input",
  "--color-ring",
  "--color-chart-1",
  "--color-chart-2",
  "--color-chart-3",
  "--color-chart-4",
  "--color-chart-5",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--color-sidebar",
  "--color-sidebar-foreground",
  "--color-sidebar-primary",
  "--color-sidebar-primary-foreground",
  "--color-sidebar-accent",
  "--color-sidebar-accent-foreground",
  "--color-sidebar-border",
  "--color-sidebar-ring",
  "--animate-skeleton",
  "--animate-toast-success-odd",
  "--animate-toast-success-even",
  "--animate-toast-error-odd",
  "--animate-toast-error-even",
  "--color-warning-foreground",
  "--color-warning",
  "--color-success-foreground",
  "--color-success",
  "--color-info-foreground",
  "--color-info",
  "--color-brand",
  "--color-brand-foreground",
  "--color-brand-illustration",
];

function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `selector ${selector} present`).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    if (depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("unbalanced");
}

describe("styles.css — canonical token sheet", () => {
  it("has no @source directives (consumers add their own) and imports tailwind + tw-animate-css", () => {
    expect(css).not.toMatch(/@source/);
    expect(wiring).not.toMatch(/@source/);
    expect(css).toMatch(/^@import "tailwindcss";/m);
    expect(css).toMatch(/^@import "tw-animate-css";/m);
  });
  it("defines `dark:` as a block variant a consumer can redefine", () => {
    // The 1.1.0 single-line form could not also carry the `system` media query. What the
    // variant compiles to is pinned in styles-selectors.test.ts.
    expect(css).toContain("@custom-variant dark {");
  });
  it("wires the token utilities to the default selectors", () => {
    expect(wiring).toMatch(/^@import "\.\/styles\/core\.css";/);
    // `light` and `system-light` beside `:root` let a light subtree sit inside a dark one.
    expect(wiring).toMatch(
      /\n:root,\n\[data-theme="light"\],\n\[data-theme="system-light"\] \{\n {2}@apply theme-neutral-light theme-mode-light;/,
    );
    // A theme script writes `system-dark` when the OS is dark and nothing is stored; it
    // must get the dark tokens, not just the `dark:` variant.
    expect(wiring).toMatch(
      /\n\[data-theme="dark"\],\n\[data-theme="system-dark"\] \{\n {2}@apply theme-neutral-dark theme-mode-dark;/,
    );
  });
  it("maps exactly the v2 @theme inline keys", () => {
    const theme = block("@theme inline");
    const keys = [...theme.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]);
    expect(keys.sort()).toEqual([...THEME_KEYS].sort());
    expect(keys).toHaveLength(55);
  });
  it("declares the four TST-4 toast replay keyframes coss keeps out of the registry", () => {
    expect(css).toMatch(/@keyframes toast-success-odd/);
    expect(css).toMatch(/@keyframes toast-success-even/);
    expect(css).toMatch(/@keyframes toast-error-odd/);
    expect(css).toMatch(/@keyframes toast-error-even/);
  });
  it("carries the 40 tilli values as :root defaults and 38 dark overrides, with NO tenant selectors", () => {
    // 42 themed values in the light utility (39 from 1.1.0 plus the three brand tokens), and
    // --radius, which no theme changes.
    const root = block("@utility theme-neutral-light {");
    expect([...root.matchAll(/^\s*(--[a-z0-9-]+):/gm)]).toHaveLength(42);
    expect(root).toContain("--primary: oklch(0.205 0 0);");
    expect(block("\n:root {").trim()).toBe("--radius: 0.625rem;");
    const dark = block("@utility theme-neutral-dark {");
    expect([...dark.matchAll(/^\s*(--[a-z0-9-]+):/gm)]).toHaveLength(42);
    expect(dark).toContain("--background: oklch(0.145 0 0);");
    expect(dark).toContain("--foreground: oklch(0.985 0 0);");
    expect(css).not.toMatch(/data-tenant/);
  });
  it("a11y: light-theme --muted-foreground and --destructive-foreground are darkened off the v2-pinned values — both failed axe color-contrast at 0.556/0.577 against the near-white surfaces (bg-muted, badge/alert tints) they render text on; dark theme is untouched (not exercised by the failing-axe suite)", () => {
    const root = block("@utility theme-neutral-light {");
    expect(root).not.toContain("--muted-foreground: oklch(0.556 0 0);");
    expect(root).toContain("--muted-foreground: oklch(0.5 0 0);");
    expect(root).not.toContain(
      "--destructive-foreground: oklch(0.577 0.245 27.325);",
    );
    expect(root).toContain("--destructive-foreground: oklch(0.5 0.204 27.32);");
    // --destructive itself is unchanged: only used as an icon fill/solid
    // background in the components this token reaches, never as text axe
    // checks for contrast.
    expect(root).toContain("--destructive: oklch(0.577 0.235 27.32);");
    const dark = block("@utility theme-neutral-dark {");
    expect(dark).toContain("--muted-foreground: oklch(0.708 0 0);");
    expect(dark).toContain(
      "--destructive-foreground: oklch(0.637 0.237 25.33);",
    );
  });
});
