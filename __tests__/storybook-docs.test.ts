import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const STORIES = "apps/storybook/src/stories";
const DOCS = "apps/storybook/src/docs";
const SITE = "https://tilli-pro.github.io/ui-atoms/";

describe("the Storybook is the documentation site", () => {
  it("generates a docs page for every component", () => {
    expect(read("apps/storybook/.storybook/preview.tsx")).toMatch(
      /^ {2}tags: \["autodocs"\],$/m,
    );
    const files = readdirSync(resolve(root, STORIES)).filter((f) =>
      f.endsWith(".stories.tsx"),
    );
    expect(files.length).toBeGreaterThanOrEqual(62);
    for (const file of files) {
      const text = read(`${STORIES}/${file}`);
      expect(text, file).toMatch(/^ {2}component: \w+,$/m);
      expect(text, file).toMatch(/^ {2}title: "Components\/[^"]+",$/m);
      expect(text, file).not.toContain("!autodocs");
    }
  });

  it("loads five MDX pages and sorts Docs before Components", () => {
    expect(read("apps/storybook/.storybook/main.ts")).toContain(
      '"../src/**/*.mdx"',
    );
    const pages = readdirSync(resolve(root, DOCS)).sort();
    expect(pages).toEqual([
      "accessibility.mdx",
      "installation.mdx",
      "introduction.mdx",
      "styling-and-tokens.mdx",
      "theming.mdx",
    ]);
    expect(
      pages.map(
        (p) => /<Meta title="([^"]+)" \/>/.exec(read(`${DOCS}/${p}`))?.[1],
      ),
    ).toEqual([
      "Docs/Accessibility",
      "Docs/Installation",
      "Docs/Introduction",
      "Docs/Styling and tokens",
      "Docs/Theming",
    ]);
    expect(read("apps/storybook/.storybook/preview.tsx")).toMatch(
      /order:\s*\[\s*"Docs",\s*\[\s*"Introduction",\s*"Installation",\s*"Styling and tokens",\s*"Theming",\s*"Accessibility",?\s*\],\s*"Components",?\s*\]/,
    );
  });

  it("names no internal system on a public page", () => {
    const internal = /tilliX|tillix|tenant-ui|flux|~\/tilli|spec \u00a7/;
    for (const page of readdirSync(resolve(root, DOCS)))
      expect(read(`${DOCS}/${page}`), page).not.toMatch(internal);
    expect(read("packages/ui-atoms/README.md")).not.toMatch(internal);
    expect(read("packages/ui-atoms/src/styles.css")).not.toMatch(internal);
  });

  it("points the package at the documentation site", () => {
    expect(JSON.parse(read("packages/ui-atoms/package.json")).homepage).toBe(
      SITE,
    );
    expect(read("packages/ui-atoms/README.md")).toContain(SITE);
  });

  it("deploys the static build to GitHub Pages from the public repository only", () => {
    const pages = read(".github/workflows/pages.yml");
    expect(
      pages.match(/^ {4}if: github\.repository == 'tilli-pro\/ui-atoms'$/gm),
    ).toHaveLength(2);
    expect(pages).toContain(
      "cp -R apps/storybook/storybook-static _site/storybook",
    );
    expect(pages).toContain("path: _site");
    expect(pages).toMatch(/uses: actions\/deploy-pages@v5\.\d+\.\d+$/m);
    expect(pages).toMatch(/pages: write\n\s+id-token: write/);
  });

  it("documents every public export of ./theme in the theming guide", () => {
    const guide = read(`${DOCS}/theming.mdx`);
    const index = read("packages/ui-atoms/src/theme/index.ts");
    const names = [...index.matchAll(/export \{([^}]+)\}/g)]
      .flatMap((m) => (m[1] ?? "").split(","))
      .map((name) => name.trim())
      .filter((name) => name !== "" && !name.startsWith("type "));
    expect(names.length).toBeGreaterThan(10);
    for (const name of names) expect(guide, name).toContain(name);
    for (const utility of [
      "theme-neutral-light",
      "theme-neutral-dark",
      "theme-neutral-contrast-light",
      "theme-neutral-contrast-dark",
      "theme-mode-light",
      "theme-mode-dark",
      "theme-seeded",
      "high-contrast:",
      "styles/core.css",
    ])
      expect(guide, utility).toContain(utility);
  });

  it("lets a visitor switch between the built-in themes", () => {
    const preview = read("apps/storybook/.storybook/preview.tsx");
    // The neutral sheet is always loaded; the others are @tilli.dev/themes' own entry points,
    // added on top when the toolbar asks for them.
    expect(read("apps/storybook/src/styles/globals.css")).toContain(
      '@import "@tilli.dev/ui-atoms/styles.css";',
    );
    expect(read("apps/storybook/src/styles/tilli.css")).toContain(
      '@import "@tilli.dev/themes/tilli.css";',
    );
    expect(read("apps/storybook/src/styles/beacon.css")).toContain(
      '@import "@tilli.dev/themes/beacon.css";',
    );
    expect(preview).toContain('"../src/styles/tilli.css?inline"');
    expect(read("apps/storybook/src/styles/nudge.css")).toContain(
      '@import "@tilli.dev/themes/nudge.css";',
    );
    expect(preview).toContain('"../src/styles/beacon.css?inline"');
    expect(preview).toContain('"../src/styles/nudge.css?inline"');
    expect(preview).toMatch(/palette:\s*\{[^}]*name: "Theme"/);
    expect(preview).toMatch(
      /value: "neutral"[\s\S]*value: "tilli"[\s\S]*value: "beacon"[\s\S]*value: "nudge"/,
    );
    expect(preview).toMatch(/initialGlobals:[^\n]*palette: "neutral"/);
  });
});
