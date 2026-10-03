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

  it("loads four MDX pages and sorts Docs before Components", () => {
    expect(read("apps/storybook/.storybook/main.ts")).toContain(
      '"../src/**/*.mdx"',
    );
    const pages = readdirSync(resolve(root, DOCS)).sort();
    expect(pages).toEqual([
      "accessibility.mdx",
      "installation.mdx",
      "introduction.mdx",
      "styling-and-tokens.mdx",
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
    ]);
    expect(read("apps/storybook/.storybook/preview.tsx")).toMatch(
      /order:\s*\[\s*"Docs",\s*\[\s*"Introduction",\s*"Installation",\s*"Styling and tokens",\s*"Accessibility",?\s*\],\s*"Components",?\s*\]/,
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
    expect(pages).toContain("path: apps/storybook/storybook-static");
    expect(pages).toContain("uses: actions/deploy-pages@v4");
    expect(pages).toMatch(/pages: write\n\s+id-token: write/);
  });
});
