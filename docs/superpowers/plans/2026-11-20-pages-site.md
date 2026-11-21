# GitHub Pages Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a new bare `apps/pages` app at the Pages root, with the built Storybook at `/storybook/` and the built playground at `/playground/`.

**Architecture:** Three independent static builds copied into one `_site/` folder by the Pages workflow. The playground becomes path-independent (hash router, relative asset base); Storybook's build already is; the root app takes its base path from `BASE_PATH`.

**Tech Stack:** Vite 7, React 19, react-router 8, Storybook 10, turbo, pnpm catalogs, GitHub Actions Pages.

**Spec:** `docs/superpowers/specs/2026-11-20-pages-site-design.md`

## Global Constraints

- Site base path is `/ui-atoms/` (`https://tilli-pro.github.io/ui-atoms/`).
- New app directory `apps/pages`, package name `pages`, dependencies via `catalog:` only.
- No new tests; never tests for recipes (CLAUDE.md).
- The enterprise recipe's source is not modified.
- Storybook config is not modified.

## Review Focus

No task has automated tests; these are checked by hand in Task 4.

- Deep link / refresh on `/ui-atoms/playground/#/recipes/enterprise-ui-ux#/<module>/<item>` restores the same view.
- Lazy recipe chunks and CSS load from `/ui-atoms/playground/assets/` (relative base), not the site root.
- Storybook manager and preview iframe load under `/ui-atoms/storybook/`.
- Root app assets load under `/ui-atoms/assets/` when `BASE_PATH=/ui-atoms/`, and under `/` in local dev.
- Playground "back to list" links (`<Link to="/">`) stay inside `/playground/`.

---

### Task 1: `apps/pages` bare app

**Files:**
- Create: `apps/pages/package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `biome.json`, `src/main.tsx`, `src/app.tsx`

- [ ] **Step 1:** `package.json`: name `pages`, private, `type: module`, scripts `dev: vite`, `build: vite build`, `typecheck: tsc --noEmit`, `lint: biome check .`; deps `react`, `react-dom`; devDeps `@biomejs/biome`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, `vite` (all `catalog:`).
- [ ] **Step 2:** `vite.config.ts`: `react()` plugin, `base: process.env.BASE_PATH ?? "/"`. `tsconfig.json` and `biome.json` mirror `apps/playground` minus vitest/recipe specifics.
- [ ] **Step 3:** `src/app.tsx` exports `App(): null`; `src/main.tsx` mounts it in `StrictMode` on `#root`; `index.html` titled `ui-atoms`.
- [ ] **Step 4:** `pnpm install`, then `pnpm turbo run build typecheck lint --filter=pages` passes; `BASE_PATH=/ui-atoms/ pnpm --filter pages build` emits `dist/index.html` referencing `/ui-atoms/assets/`.

### Task 2: Path-independent playground

**Files:**
- Modify: `apps/playground/src/main.tsx` (`createBrowserRouter` → `createHashRouter`)
- Modify: `apps/playground/vite.config.ts` (`base: "./"`)
- Modify: `apps/playground/README.md` (routes described in hash form)

- [ ] **Step 1:** Make the two code changes and the README wording change.
- [ ] **Step 2:** `pnpm turbo run build typecheck lint test --filter=playground` passes; `dist/index.html` references `./assets/`.

### Task 3: Workflow and docs

**Files:**
- Modify: `.github/workflows/pages.yml`
- Modify: `README.md:7`

- [ ] **Step 1:** Build step becomes `pnpm turbo run build --filter=pages --filter=storybook --filter=playground` with `BASE_PATH: /${{ github.event.repository.name }}/`; add an assemble step copying `apps/pages/dist` → `_site`, `apps/storybook/storybook-static` → `_site/storybook`, `apps/playground/dist` → `_site/playground`; upload `_site`. Update the header comment.
- [ ] **Step 2:** README documentation link → `https://tilli-pro.github.io/ui-atoms/storybook/`; add the playground link.

### Task 4: End-to-end verification

- [ ] **Step 1:** `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` at the root.
- [ ] **Step 2:** Assemble `_site` in the scratchpad exactly as the workflow does, under a `ui-atoms/` parent, and serve the parent statically.
- [ ] **Step 3:** In a browser check every Review Focus line.
