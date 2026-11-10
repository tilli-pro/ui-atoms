#!/usr/bin/env tsx
/**
 * `pnpm --filter playground recipe`: create, version, list and delete
 * playground recipes. Only the prompt loop lives here; everything it decides
 * or writes goes through the importable modules next to it.
 */
import { relative } from "node:path";
import {
  autocompleteMultiselect,
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  select,
  text,
} from "@clack/prompts";
import { LIMITS, type Recipe } from "../recipes-manifest.js";
import { loadComponentSubpaths } from "./components.js";
import {
  createRecipe,
  deleteRecipe,
  modulePath,
  type PlaygroundPaths,
  readManifest,
  resolvePaths,
  versionRecipe,
} from "./files.js";
import { formatDate } from "./recipes.js";
import { BUMPS, type Bump, bumpVersion } from "./semver.js";
import { formatRecipeTable } from "./table.js";
import {
  validateChanges,
  validateDescription,
  validateRecipeName,
} from "./validate.js";

type Action = "create" | "version" | "list" | "delete" | "exit";

/** Ctrl+C (or Esc) on any prompt ends the CLI; nothing is written mid-action. */
function unlessCancelled<T>(value: T): Exclude<T, symbol> {
  if (isCancel(value)) {
    cancel("Cancelled. Nothing was changed.");
    process.exit(0);
  }
  return value as Exclude<T, symbol>;
}

function recipeOptions(recipes: readonly Recipe[]) {
  return recipes.map((r) => ({
    value: r.slug,
    label: r.slug,
    hint: `v${r.version} · ${r.title}`,
  }));
}

async function create(paths: PlaygroundPaths): Promise<void> {
  const existing = readManifest(paths).map((r) => r.slug);
  const name = unlessCancelled(
    await text({
      message: "Recipe name",
      placeholder: "e.g. Settings dialog",
      validate: (value) => validateRecipeName(value, existing),
    }),
  );
  const description = unlessCancelled(
    await text({
      message: `Description (optional, max ${LIMITS.description} characters)`,
      defaultValue: "",
      validate: validateDescription,
    }),
  );
  const available = loadComponentSubpaths();
  const components = unlessCancelled(
    await autocompleteMultiselect<string>({
      message: "ui-atoms components used (optional; type to filter)",
      options: available.map((c) => ({ value: c, label: c })),
      required: false,
      maxItems: 12,
    }),
  );
  const recipe = createRecipe(
    paths,
    { name, description, components },
    formatDate(new Date()),
    available,
  );
  log.success(
    `Created "${recipe.title}" (${recipe.slug}) at v${recipe.version}.\n` +
      `Edit ${relative(process.cwd(), modulePath(paths, recipe.slug))}, then open /recipes/${recipe.slug}.`,
  );
}

async function version(paths: PlaygroundPaths): Promise<void> {
  const recipes = readManifest(paths);
  if (recipes.length === 0) {
    log.warn("There are no recipes to version yet.");
    return;
  }
  const slug = unlessCancelled(
    await select<string>({
      message: "Which recipe?",
      options: recipeOptions(recipes),
    }),
  );
  const current = recipes.find((r) => r.slug === slug);
  if (!current) return;
  const changes = unlessCancelled(
    await text({
      message: `What changed? (max ${LIMITS.changes} characters)`,
      validate: validateChanges,
    }),
  );
  const bump = unlessCancelled(
    await select<Bump>({
      message: "Version bump",
      options: BUMPS.map((b) => ({
        value: b,
        label: b,
        hint: `${current.version} -> ${bumpVersion(current.version, b)}`,
      })),
    }),
  );
  const recipe = versionRecipe(
    paths,
    slug,
    bump,
    changes,
    formatDate(new Date()),
  );
  log.success(`${recipe.slug} is now v${recipe.version}.`);
}

function list(paths: PlaygroundPaths): void {
  const recipes = readManifest(paths);
  if (recipes.length === 0) {
    log.info("No recipes yet.");
    return;
  }
  log.message(formatRecipeTable(recipes));
}

async function remove(paths: PlaygroundPaths): Promise<void> {
  const recipes = readManifest(paths);
  if (recipes.length === 0) {
    log.warn("There are no recipes to delete.");
    return;
  }
  const slug = unlessCancelled(
    await select<string>({
      message: "Which recipe should be deleted?",
      options: recipeOptions(recipes),
    }),
  );
  const sure = unlessCancelled(
    await confirm({
      message: `Delete "${slug}"? This removes src/recipes/${slug}.tsx and its recipes.json entry.`,
      initialValue: false,
    }),
  );
  if (!sure) {
    log.info("Kept it.");
    return;
  }
  const hadModule = deleteRecipe(paths, slug);
  log.success(
    hadModule
      ? `Deleted ${slug}.`
      : `Deleted the ${slug} entry (its module file was already gone).`,
  );
}

async function main(): Promise<void> {
  const paths = resolvePaths();
  intro("ui-atoms playground recipes");
  for (;;) {
    const action = unlessCancelled(
      // biome-ignore lint/performance/noAwaitInLoops: an interactive menu is sequential by design
      await select<Action>({
        message: "What would you like to do?",
        options: [
          { value: "create", label: "Create recipe" },
          { value: "version", label: "Version recipe" },
          { value: "list", label: "List recipes" },
          { value: "delete", label: "Delete recipe" },
          { value: "exit", label: "Exit" },
        ],
      }),
    );
    try {
      switch (action) {
        case "create":
          await create(paths);
          break;
        case "version":
          await version(paths);
          break;
        case "list":
          list(paths);
          break;
        case "delete":
          await remove(paths);
          break;
        case "exit":
          outro("Done.");
          return;
        default:
          return;
      }
    } catch (error) {
      log.error((error as Error).message);
    }
  }
}

await main();
