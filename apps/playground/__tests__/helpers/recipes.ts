import type { Recipe } from "../../src/recipes-manifest.js";

/** A valid recipe for tests; `title` defaults to the slug in sentence case. */
export function makeRecipe(
  slug: string,
  overrides: Partial<Recipe> = {},
): Recipe {
  const version = overrides.version ?? "1.0.0";
  const title =
    slug.charAt(0).toUpperCase() + slug.slice(1).replaceAll("-", " ");
  return {
    slug,
    title,
    description: "",
    version,
    components: [],
    changelog: [{ version, date: "2026-01-01", changes: "Initial recipe." }],
    ...overrides,
  };
}
