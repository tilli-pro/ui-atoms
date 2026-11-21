# ui-atoms

## Playground recipes (`apps/playground/src/recipes/`)

- Recipes are a pure sandbox: **never write tests for a recipe** (no
  `apps/playground/__tests__/recipes/`). The catalog, routes and CLI tests
  already cover the registry; a recipe module is verified by `lint`,
  `typecheck`, `build` and by using it in the dev server.
