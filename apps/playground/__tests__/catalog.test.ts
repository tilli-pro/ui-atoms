import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { recipes } from "../src/catalog.js";
import { loadComponentSubpaths } from "../src/cli/components.js";
import {
  serializeManifest,
  slugFromModulePath,
} from "../src/recipes-manifest.js";

/** A function component, or a memo/forwardRef/lazy object. */
function isComponent(value: unknown): boolean {
  return (
    typeof value === "function" ||
    (typeof value === "object" && value !== null && "$$typeof" in value)
  );
}

const PLAYGROUND = resolve(import.meta.dirname, "..");
const RECIPES_DIR = resolve(PLAYGROUND, "src", "recipes");
const UI_ATOMS_IMPORT = /from\s+["']@tilli\.dev\/ui-atoms\/([^"']+)["']/g;

const modules = import.meta.glob<{ default?: unknown }>(
  "../src/recipes/*.tsx",
  {
    eager: true,
  },
);
const moduleSlugs = Object.keys(modules)
  .map(slugFromModulePath)
  .filter((s) => s !== undefined)
  .sort();
const manifestSlugs = recipes.map((r) => r.slug);

describe("recipes.json <-> src/recipes/*.tsx", () => {
  it("contains the nested-sidebar recipe", () => {
    expect(manifestSlugs).toContain("nested-sidebar");
  });

  it("has a module for every entry and an entry for every module", () => {
    expect(moduleSlugs).toEqual([...manifestSlugs].sort());
    expect(readdirSync(RECIPES_DIR).sort()).toEqual(
      moduleSlugs.map((s) => `${s}.tsx`),
    );
  });

  it.each(Object.entries(modules))(
    "%s default-exports a React component",
    (_, mod) => {
      expect(isComponent(mod.default)).toBe(true);
    },
  );

  it.each(recipes.map((r) => [r.slug, r] as const))(
    "%s lists exactly the ui-atoms subpaths its module imports",
    (slug, recipe) => {
      const source = readFileSync(resolve(RECIPES_DIR, `${slug}.tsx`), "utf8");
      const imported = [...source.matchAll(UI_ATOMS_IMPORT)]
        .map((m) => m[1])
        .sort();
      expect([...new Set(imported)]).toEqual(recipe.components);
      expect(loadComponentSubpaths()).toEqual(
        expect.arrayContaining(recipe.components),
      );
    },
  );

  it("is stored in canonical form, as the CLI writes it", () => {
    const text = readFileSync(resolve(PLAYGROUND, "recipes.json"), "utf8");
    expect(text).toBe(serializeManifest(recipes));
  });
});
