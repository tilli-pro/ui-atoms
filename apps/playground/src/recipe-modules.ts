import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { compareStrings, slugFromModulePath } from "./recipes-manifest.js";

/**
 * A recipe module on disk: `src/recipes/<slug>.tsx`, or a folder
 * `src/recipes/<slug>/` whose `index.tsx` is the module. Node-only; the
 * browser side (catalog.ts) finds modules with `import.meta.glob` instead.
 */
export interface RecipeModuleFile {
  slug: string;
  /** The module itself: the file, or the folder's `index.tsx`. */
  path: string;
  /** True for a folder recipe. */
  dir: boolean;
}

/** Every recipe module in `recipesDir`, sorted by slug. Folders without an `index.tsx` are ignored. */
export function listRecipeModules(recipesDir: string): RecipeModuleFile[] {
  const out: RecipeModuleFile[] = [];
  for (const entry of readdirSync(recipesDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const index = join(recipesDir, entry.name, "index.tsx");
      if (existsSync(index))
        out.push({ slug: entry.name, path: index, dir: true });
    } else {
      const slug = slugFromModulePath(entry.name);
      if (slug !== undefined)
        out.push({ slug, path: join(recipesDir, entry.name), dir: false });
    }
  }
  return out.sort((a, b) => compareStrings(a.slug, b.slug));
}

/** The module of `slug`, as a file or a folder, if either exists (the file wins). */
export function findRecipeModule(
  recipesDir: string,
  slug: string,
): RecipeModuleFile | undefined {
  const file = join(recipesDir, `${slug}.tsx`);
  if (existsSync(file)) return { slug, path: file, dir: false };
  const index = join(recipesDir, slug, "index.tsx");
  if (existsSync(index)) return { slug, path: index, dir: true };
  return;
}

/** Where the module lives on disk: the file, or the whole folder of a folder recipe. */
export function recipeModuleRoot(module: RecipeModuleFile): string {
  return module.dir ? dirname(module.path) : module.path;
}

const SOURCE_FILE = /\.tsx?$/;

/** Every `.ts`/`.tsx` source of a module: the file itself, or all files under its folder. */
export function recipeSourceFiles(module: RecipeModuleFile): string[] {
  if (!module.dir) return [module.path];
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (SOURCE_FILE.test(entry.name) && statSync(path).isFile())
        files.push(path);
    }
  };
  walk(dirname(module.path));
  return files.sort(compareStrings);
}
