![@tilli.dev](./assets/tilli-wordmark-dark.svg)

# @tilli.dev/ui-atoms

React 19 + Tailwind CSS v4 components on `@base-ui/react`, following the coss ui
conventions: flat per-part named exports, `render` prop composition, `data-slot`
selectors, styled parts plus `*Primitive` parts and exported cva variants.

- Documentation and live examples: https://tilli-pro.github.io/ui-atoms/storybook/
- Recipes playground: https://tilli-pro.github.io/ui-atoms/playground/
- Package: `packages/ui-atoms` (`@tilli.dev/ui-atoms`, MIT).
- Themes: `packages/themes` (`@tilli.dev/themes`, MIT), the tilli, beacon and nudge themes.
- Install: `pnpm add @tilli.dev/ui-atoms @base-ui/react react react-dom tailwindcss`.
- Styles: import `@tilli.dev/ui-atoms/styles.css` once and add the `@source` lines from
  `packages/ui-atoms/README.md` to your Tailwind entry.
- Trying an unreleased build: `pnpm pack:tarball` writes the package tarball to `.tarballs/`;
  install that file in your app with `pnpm add <path to the .tgz>`.
- Contributing: see `CONTRIBUTING.md`.

## Claude Code skills

`.claude/` holds agents, commands and skills for working on this repository with Claude Code.

- `skills/playground-recipes` is this repository's own: how to add and version a playground
  recipe.
- The design agents (`brand-architect`, `design-master`, `visual-historian`), commands
  (`/brand-identity`, `/design-audit`, `/premium-landing`, `/style-guide`) and skills
  (`brand-systems`, `design-masters`, `design-movements`, `design-principles`,
  `premium-saas-design`) come from
  [design-mastery-claude-code](https://github.com/HermeticOrmus/design-mastery-claude-code) by
  Hermetic Ormus, under the MIT License. Its notice is in `.claude/THIRD-PARTY-NOTICES.md`.
