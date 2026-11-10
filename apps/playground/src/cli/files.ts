import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  parseManifest,
  type Recipe,
  serializeManifest,
} from "../recipes-manifest.js";
import {
  addRecipe,
  bumpRecipe,
  type NewRecipeInput,
  removeRecipe,
} from "./recipes.js";
import { renderRecipeModule } from "./template.js";
import type { Bump } from "./semver.js";

/** Where the playground keeps its recipes; `root` is the apps/playground directory. */
export interface PlaygroundPaths {
  root: string;
  manifest: string;
  recipesDir: string;
}

export function resolvePaths(
  root: string = resolve(import.meta.dirname, "..", ".."),
): PlaygroundPaths {
  return {
    root,
    manifest: join(root, "recipes.json"),
    recipesDir: join(root, "src", "recipes"),
  };
}

export function modulePath(paths: PlaygroundPaths, slug: string): string {
  return join(paths.recipesDir, `${slug}.tsx`);
}

export function readManifest(paths: PlaygroundPaths): Recipe[] {
  const raw = readFileSync(paths.manifest, "utf8");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `recipes.json is not valid JSON: ${(error as Error).message}`,
    );
  }
  return parseManifest(json);
}

/** Write-then-rename, so an interrupted write never leaves a truncated recipes.json. */
export function writeManifest(
  paths: PlaygroundPaths,
  recipes: readonly Recipe[],
): void {
  const content = serializeManifest(parseManifest(recipes));
  const tmp = `${paths.manifest}.${process.pid}.tmp`;
  writeFileSync(tmp, content);
  renameSync(tmp, paths.manifest);
}

export function createRecipe(
  paths: PlaygroundPaths,
  input: NewRecipeInput,
  today: string,
  knownComponents?: readonly string[],
): Recipe {
  const current = readManifest(paths);
  const { recipes, recipe } = addRecipe(current, input, today, knownComponents);
  const file = modulePath(paths, recipe.slug);
  if (existsSync(file))
    throw new Error(
      `src/recipes/${recipe.slug}.tsx already exists but has no recipes.json entry; remove or rename it first.`,
    );
  // `wx` fails rather than overwrite, should the file appear meanwhile.
  writeFileSync(file, renderRecipeModule(recipe.slug, recipe.components), {
    flag: "wx",
  });
  try {
    writeManifest(paths, recipes);
  } catch (error) {
    rmSync(file, { force: true });
    throw error;
  }
  return recipe;
}

export function versionRecipe(
  paths: PlaygroundPaths,
  slug: string,
  bump: Bump,
  changes: string,
  today: string,
): Recipe {
  const { recipes, recipe } = bumpRecipe(
    readManifest(paths),
    slug,
    bump,
    changes,
    today,
  );
  writeManifest(paths, recipes);
  return recipe;
}

/** Removes the entry first, then the module; returns whether a module file was deleted. */
export function deleteRecipe(paths: PlaygroundPaths, slug: string): boolean {
  const recipes = removeRecipe(readManifest(paths), slug);
  writeManifest(paths, recipes);
  const file = modulePath(paths, slug);
  const existed = existsSync(file);
  rmSync(file, { force: true });
  return existed;
}
