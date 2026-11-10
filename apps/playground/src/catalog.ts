import type { ComponentType } from "react";
import manifestJson from "../recipes.json";
import {
  diffRecipeModules,
  parseManifest,
  type Recipe,
  slugFromModulePath,
} from "./recipes-manifest.js";

export interface RecipeModule {
  default: ComponentType;
}

export type RecipeLoader = () => Promise<RecipeModule>;

/** Every `src/recipes/<slug>.tsx`, keyed by slug, each its own lazy chunk. */
export function loadersBySlug(
  modules: Record<string, RecipeLoader>,
): Record<string, RecipeLoader> {
  const out: Record<string, RecipeLoader> = {};
  for (const [path, load] of Object.entries(modules)) {
    const slug = slugFromModulePath(path);
    if (slug) out[slug] = load;
  }
  return out;
}

export const recipes: readonly Recipe[] = parseManifest(manifestJson);

export const recipeLoaders = loadersBySlug(
  import.meta.glob<RecipeModule>("./recipes/*.tsx"),
);

if (import.meta.env.DEV) {
  const { missingModules, missingEntries } = diffRecipeModules(
    recipes.map((r) => r.slug),
    Object.keys(recipeLoaders),
  );
  for (const slug of missingModules)
    console.error(
      `recipes.json lists "${slug}" but src/recipes/${slug}.tsx does not exist; its route is skipped.`,
    );
  for (const slug of missingEntries)
    console.error(
      `src/recipes/${slug}.tsx has no recipes.json entry; run \`pnpm --filter playground recipe\` or add one.`,
    );
}
