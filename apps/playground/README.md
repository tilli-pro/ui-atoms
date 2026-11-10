# playground

A private Vite app of **recipes**: small example compositions built from
`@tilli.dev/ui-atoms`, consumed through the package's published exports map
(its `dist/`), exactly as an outside app would.

## Running it

```sh
pnpm install
pnpm --filter @tilli.dev/ui-atoms build   # the playground imports ui-atoms from dist
pnpm --filter playground dev              # http://localhost:5173
```

- `/` lists every recipe as a card (title, description, version), 16 per
  page; the page is in the URL (`/?page=2`).
- `/recipes/<slug>` renders that recipe's default-exported component, loaded
  as its own chunk.
- Anything else is a 404 page.

Other scripts: `build` (production build into `dist/`), `typecheck`, `lint`
(Biome) and `test` (Vitest), all run as `pnpm --filter playground <script>`.

## How recipes are stored

- `recipes.json` is the source of truth: an array, sorted by slug, of
  `{ slug, title, description, version, components, changelog }`. `version` is
  semver starting at `1.0.0`; `changelog` is oldest-first
  `{ version, date, changes }`; `components` lists the ui-atoms subpaths the
  recipe imports (`"sidebar"` for `@tilli.dev/ui-atoms/sidebar`).
- `src/recipes/<slug>.tsx` is the recipe itself and must `export default` the
  React component the route renders.
- The routes are built from `recipes.json` (`src/routes.tsx`), with the
  modules found by `import.meta.glob("./recipes/*.tsx")`.

The two must agree: `vite build` fails when an entry has no module or a module
has no entry, and `__tests__/catalog.test.ts` also checks that every module
default-exports a component, that each entry's `components` match the module's
`@tilli.dev/ui-atoms/*` imports, and that `recipes.json` is in the CLI's
canonical format. Prefer the CLI over hand edits; if you do edit by hand, keep
that format (the test tells you when it drifts).

## The recipe CLI

```sh
pnpm --filter playground recipe
```

An interactive menu (arrow keys and Enter; Ctrl+C cancels at any prompt, and
nothing is written until an action's last answer is in):

- **Create recipe**: asks for a name (required, at most 100 characters; the
  kebab-case slug is derived from it and must be new), a description
  (optional, at most 1024 characters) and the ui-atoms components used (an
  optional, filterable multi-select over the component subpaths in
  `@tilli.dev/ui-atoms`'s exports map). It writes `src/recipes/<slug>.tsx` with
  one `import {} from "@tilli.dev/ui-atoms/<component>";` line per component
  for you to fill in, plus a default-exported component stub, and adds the
  entry to `recipes.json` at `1.0.0`. Until you fill the imports in, Biome
  warns about them (`noUnusedImports`); that warning is your to-do list.
- **Version recipe**: pick a recipe, describe the changes (required, at most
  2048 characters), choose patch, minor or major. The version is bumped and a
  changelog entry with today's date is appended.
- **List recipes**: a table of slug, title, version and component count.
- **Delete recipe**: pick a recipe and confirm; its `recipes.json` entry and
  its module file are removed.

If a recipe later uses more or fewer ui-atoms components, update its
`components` in `recipes.json` to match its imports.

The prompt loop is `src/cli/main.ts`; the logic it calls (slugs, validation,
`recipes.json` parsing and writing, version bumps, the template) lives in the
other `src/cli/*.ts` modules and `src/recipes-manifest.ts`, which have unit
tests under `__tests__/`.
