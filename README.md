# @tilli.dev/ui-atoms

React 19 + Tailwind CSS v4 components on `@base-ui/react`, following the coss ui
conventions: flat per-part named exports, `render` prop composition, `data-slot`
selectors, styled parts plus `*Primitive` parts and exported cva variants.

- Documentation and live examples: https://tilli-pro.github.io/ui-atoms/
- Package: `packages/ui-atoms` (`@tilli.dev/ui-atoms`, MIT).
- Install: `pnpm add @tilli.dev/ui-atoms @base-ui/react react react-dom tailwindcss`.
- Styles: import `@tilli.dev/ui-atoms/styles.css` once and add the `@source` lines from
  `packages/ui-atoms/README.md` to your Tailwind entry.
- Trying an unreleased build: `pnpm pack:tarball` writes the package tarball to `.tarballs/`;
  install that file in your app with `pnpm add <path to the .tgz>`.
- Contributing: see `CONTRIBUTING.md`.
