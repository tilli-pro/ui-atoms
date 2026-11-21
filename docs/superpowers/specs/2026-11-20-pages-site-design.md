# GitHub Pages site: root app, Storybook and playground

## Intent

The Pages site at `https://tilli-pro.github.io/ui-atoms/` currently serves only
the Storybook. It should serve a new root app, with the built Storybook under
`/storybook/` and the built playground under `/playground/`. The root app's
content is out of scope here: its owner builds it later.

## Goals

- `apps/pages` (package name `pages`): a bare Vite + React app that renders
  nothing, deployed at the site root.
- Storybook served at `/ui-atoms/storybook/`.
- Playground served at `/ui-atoms/playground/`, including deep links and
  refreshes, and with the Enterprise UI/UX recipe's in-recipe navigation intact.

## Non-goals

- Any content, routing or styling in the root app.
- Redirects from old Storybook URLs at the site root.
- New tests (recipes are never tested; the rest is config).

## Approaches

1. **Hash routing in the playground, relative asset base (picked).** The
   playground switches to `createHashRouter` and builds with `base: "./"`, so
   one build works at any path and Pages needs no SPA fallback. Cost: recipe
   URLs become `/#/recipes/<slug>`, and the enterprise recipe's own hash state
   nests as `#/recipes/enterprise-ui-ux#/network/...`.
2. **Browser routing with a `404.html` fallback.** Keeps clean URLs but needs a
   router basename, an absolute base path, and a site-level 404 redirect shim
   that the root app would have to coexist with. Rejected: more moving parts
   for a sandbox app.

Storybook needs no change under either: its static build uses relative URLs.

## Design

- **`apps/pages`**: `index.html`, `src/main.tsx` rendering a component that
  returns `null`, `vite.config.ts` with `base` from `BASE_PATH` (default `/`),
  tsconfig and biome config mirroring the playground, and `dev`, `build`,
  `typecheck`, `lint` scripts.
- **Playground**: `createHashRouter` in `src/main.tsx`; `base: "./"` in
  `vite.config.ts`. The enterprise recipe is untouched: it reads and writes its
  hash through react-router's `useLocation`/`useNavigate`, which a hash router
  serves as the nested hash.
- **`.github/workflows/pages.yml`**: build `pages`, `storybook` and
  `playground` with turbo (`BASE_PATH=/ui-atoms/`), assemble `_site/` from
  `apps/pages/dist`, `apps/storybook/storybook-static` (to `_site/storybook`)
  and `apps/playground/dist` (to `_site/playground`), upload `_site`.
- **Docs**: README's documentation link points at `/ui-atoms/storybook/`;
  playground README URLs use the hash form.

## Verification

`lint`, `typecheck`, `test`, `build`; then assemble `_site` locally, serve it
under `/ui-atoms/`, and check Storybook, the playground list, and the
enterprise recipe (module switch, refresh, deep link) in a browser.
