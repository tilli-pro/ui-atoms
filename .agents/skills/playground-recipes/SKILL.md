---
name: playground-recipes
description: Use when adding, editing, versioning, listing or deleting a recipe in apps/playground (the ui-atoms recipes registry - recipes.json plus src/recipes/<slug>.tsx), when a recipe must appear on the playground root page or at /recipes/<slug>, or when the catalog test, vite build or dev console complain that recipes.json and src/recipes disagree.
---

# Playground recipes

## Overview

A recipe is a small example composition of `@tilli.dev/ui-atoms` parts, living in
`apps/playground`. `recipes.json` is the registry (sorted array of
`{ slug, title, description, version, components, changelog }`); `src/recipes/<slug>.tsx`
is the module and must `export default` the component. A large recipe is a folder instead,
`src/recipes/<slug>/index.tsx` plus the files it imports; the registry accepts either form. Routes and the root card list are
generated from the registry, so nothing else is edited to publish a recipe.

**Core rule:** the registry entry and the module must agree. `__tests__/catalog.test.ts`
and `vite build` enforce: entry ⇄ module exist, module default-exports a component, the
entry's `components` equals the set of `@tilli.dev/ui-atoms/<x>` component subpaths the
module imports (every file of a folder recipe; `utils` does not count), and `recipes.json` is in the CLI's canonical (Biome) format.

## Quick reference

| Task | Do |
|---|---|
| Build ui-atoms first | `pnpm --filter @tilli.dev/ui-atoms build` (playground imports `dist/`) |
| Create / version / list / delete | `pnpm --filter playground recipe` (interactive, needs a TTY) |
| No TTY (agent, CI) | Hand-edit `recipes.json` + write the module, then `pnpm lint:fix` to restore canonical format, then run the checks below |
| Find a part's exported names | `packages/ui-atoms/src/components/<subpath>/index.tsx`, the `export {}` block at the bottom; usage in `apps/storybook/src/stories/<subpath>.stories.tsx` |
| Checks | `pnpm --filter playground lint`, `typecheck`, `test`, `build` |
| Recipe tests | None, ever: recipes are a sandbox (see root `CLAUDE.md`); the registry tests cover them |
| Split a big recipe | Move `<slug>.tsx` to `<slug>/index.tsx` (keep the default export) and extract the rest into sibling files; no registry change |

Limits: title ≤ 100 chars, slug ≤ 64 (kebab-case, derived from the title), description
≤ 1024, change note ≤ 2048. Versions are semver from `1.0.0`; `changelog` is oldest-first
and its last `version` equals the entry's `version`; dates are `YYYY-MM-DD`.

## Procedure

1. **Create** with the CLI: name, optional description, and select **every** ui-atoms
   subpath the recipe will import. The CLI writes a stub with one
   `import {} from "@tilli.dev/ui-atoms/<subpath>";` per selection and a `1.0.0` entry.
2. **Fill in** the empty imports and compose the component in `src/recipes/<slug>.tsx`.
   Biome's `noUnusedImports` warnings are the to-do list; none may remain.
3. **Imports changed later?** Edit the entry's `components` to match exactly (add or
   remove subpaths), or the catalog test fails.
4. **Version** with the CLI after a change: pick the recipe, write the change note, choose
   patch / minor / major. The CLI cannot create at a version other than `1.0.0`; reach
   `1.1.0` by creating, then bumping minor.
5. **Run the checks** in the table. Do not add a test for the recipe. No changeset: the playground is a private package and
   `.changeset/` is for `@tilli.dev/ui-atoms` only.

## Hand-editing without a TTY

Write the entry in the same shape as the existing ones (keys in the order `slug, title,
description, version, components, changelog`; `components` sorted; array sorted by slug;
titles in sentence case like "Nested sidebar"), create `src/recipes/<slug>.tsx` with the
default export, then `pnpm lint:fix` and `pnpm --filter playground test`. The catalog test
is the format oracle: if it fails on format, the diff it prints is what the CLI would have
written.

A hand-written entry at a version above `1.0.0` carries the whole history: one changelog
item per version, oldest first, each dated the day that change was made (today when they
are written together), the first at `1.0.0` with the note "Initial recipe.", and the last
item's `version` equal to the entry's `version`.

## Common mistakes

- Named export instead of `export default` → route fails to load with the module error.
- Selecting fewer components at creation than the module ends up importing → catalog test
  fails on `components`; fix the entry, do not remove imports to match.
- Editing `recipes.json` without `pnpm lint:fix` → canonical-format test fails.
- Testing against a stale `packages/ui-atoms/dist` → rebuild ui-atoms first.
- Adding a route or index entry by hand → not needed; `src/routes.tsx` globs `src/recipes/*.tsx`.
