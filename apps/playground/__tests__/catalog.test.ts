import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { recipes } from "../src/catalog.js";
import { loadComponentSubpaths } from "../src/cli/components.js";
import {
  findRecipeModule,
  listRecipeModules,
  recipeSourceFiles,
} from "../src/recipe-modules.js";
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
  ["../src/recipes/*.tsx", "../src/recipes/*/index.tsx"],
  { eager: true },
);
const moduleSlugs = Object.keys(modules)
  .map(slugFromModulePath)
  .filter((s) => s !== undefined)
  .sort();
const manifestSlugs = recipes.map((r) => r.slug);

describe("recipes.json <-> src/recipes", () => {
  it("contains the beacon-ui-ux recipe", () => {
    expect(manifestSlugs).toContain("beacon-ui-ux");
  });

  it("has a module for every entry and an entry for every module", () => {
    expect(moduleSlugs).toEqual([...manifestSlugs].sort());
    // The glob (what the app loads) and the directory walk (what the CLI and
    // the build check see) must agree on which modules exist.
    expect(listRecipeModules(RECIPES_DIR).map((m) => m.slug)).toEqual(
      moduleSlugs,
    );
  });

  it.each(Object.entries(modules))(
    "%s default-exports a React component",
    (_, mod) => {
      expect(isComponent(mod.default)).toBe(true);
    },
  );

  it.each(recipes.map((r) => [r.slug, r] as const))(
    "%s lists exactly the ui-atoms components its module imports",
    (slug, recipe) => {
      const module = findRecipeModule(RECIPES_DIR, slug);
      if (!module) throw new Error(`no module for ${slug}`);
      // Only component subpaths count: `@tilli.dev/ui-atoms/utils` and the
      // like are not components and never appear in `components`.
      const components = loadComponentSubpaths();
      const imported = recipeSourceFiles(module)
        .flatMap((file) =>
          [...readFileSync(file, "utf8").matchAll(UI_ATOMS_IMPORT)].map(
            (m) => m[1],
          ),
        )
        .filter(
          (subpath): subpath is string =>
            subpath !== undefined && components.includes(subpath),
        )
        .sort();
      expect([...new Set(imported)]).toEqual(recipe.components);
    },
  );

  it("is stored in canonical form, as the CLI writes it", () => {
    const text = readFileSync(resolve(PLAYGROUND, "recipes.json"), "utf8");
    expect(text).toBe(serializeManifest(recipes));
  });
});
