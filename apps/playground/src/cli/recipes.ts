import {
  compareStrings,
  INITIAL_VERSION,
  type Recipe,
} from "../recipes-manifest.js";
import { type Bump, bumpVersion } from "./semver.js";
import { slugify } from "./slug.js";
import {
  validateChanges,
  validateDescription,
  validateRecipeName,
} from "./validate.js";

/**
 * Pure manifest transforms behind the CLI's actions. Each validates all of
 * its input before returning a new array and never mutates its argument, so
 * an invalid request can never reach the disk.
 */

export interface NewRecipeInput {
  name: string;
  description?: string;
  components?: readonly string[];
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function formatDate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function findRecipe(recipes: readonly Recipe[], slug: string): Recipe {
  const recipe = recipes.find((r) => r.slug === slug);
  if (!recipe) throw new Error(`No recipe with the slug "${slug}".`);
  return recipe;
}

function sortBySlug(recipes: Recipe[]): Recipe[] {
  return recipes.sort((a, b) => compareStrings(a.slug, b.slug));
}

export function addRecipe(
  recipes: readonly Recipe[],
  input: NewRecipeInput,
  today: string,
  knownComponents?: readonly string[],
): { recipes: Recipe[]; recipe: Recipe } {
  const nameError = validateRecipeName(
    input.name,
    recipes.map((r) => r.slug),
  );
  if (nameError) throw new Error(nameError);
  const descriptionError = validateDescription(input.description);
  if (descriptionError) throw new Error(descriptionError);

  const components = [...new Set(input.components ?? [])].sort(compareStrings);
  if (knownComponents) {
    const unknown = components.filter((c) => !knownComponents.includes(c));
    if (unknown.length > 0)
      throw new Error(`Unknown ui-atoms component(s): ${unknown.join(", ")}.`);
  }

  const recipe: Recipe = {
    slug: slugify(input.name),
    title: input.name.trim(),
    description: (input.description ?? "").trim(),
    version: INITIAL_VERSION,
    components,
    changelog: [
      { version: INITIAL_VERSION, date: today, changes: "Initial recipe." },
    ],
  };
  return { recipes: sortBySlug([...recipes, recipe]), recipe };
}

export function bumpRecipe(
  recipes: readonly Recipe[],
  slug: string,
  bump: Bump,
  changes: string,
  today: string,
): { recipes: Recipe[]; recipe: Recipe } {
  const current = findRecipe(recipes, slug);
  const changesError = validateChanges(changes);
  if (changesError) throw new Error(changesError);
  const version = bumpVersion(current.version, bump);
  const recipe: Recipe = {
    ...current,
    version,
    changelog: [
      ...current.changelog,
      { version, date: today, changes: changes.trim() },
    ],
  };
  return {
    recipes: recipes.map((r) => (r.slug === slug ? recipe : r)),
    recipe,
  };
}

export function removeRecipe(
  recipes: readonly Recipe[],
  slug: string,
): Recipe[] {
  findRecipe(recipes, slug);
  return recipes.filter((r) => r.slug !== slug);
}
