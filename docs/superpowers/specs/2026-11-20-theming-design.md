# Extended theming for 1.2.0

## Intent

`@tilli.dev/ui-atoms` themes with one attribute and CSS variables: `data-theme="dark"` on
`<html>` swaps the tokens in `styles.css`. That is all it offers. Every consumer writes
its own toggle, persistence, system-preference handling and no-flash script (the
playground and the Storybook each hand-roll one), and the selector is fixed: an app that
themes with a `.dark` class, or with an attribute of its own, cannot use the sheet as
shipped.

1.2.0 adds an opt-in `./theme` subpath with the runtime pieces, and restructures the
sheet so the selector is the consumer's choice. The runtime is ported from the theme
feature of the author's personal site (`src/features/theme/` and
`public/theme-bootstrap.js` there), which is the author's own code; no third-party
notice is involved.

## Goals

- **Selector of the consumer's choosing.** Token values are separated from the selectors
  that apply them. `styles.css` keeps working unchanged for existing consumers; a consumer
  who wants `.dark`, `[data-mode="night"]` or a scoped subtree imports the core sheet and
  writes two lines.
- **`system` as a first-class value.** `data-theme` accepts `light`, `dark`, `system`,
  `system-light`, `system-dark`. `system` works with CSS alone (media query); the
  `system-*` values are what the runtime writes, so CSS and JS can both tell a choice from
  a followed preference.
- **A contrast axis.** `data-contrast` with `normal`, `high`, `system`, `system-normal`,
  `system-high`, a `high-contrast:` variant, and a small high-contrast token set.
- **Runtime, opt-in, framework-free at its core.** A store that treats the DOM attribute
  as the source of truth, a `useTheme` hook, an optional provider, and a pre-paint script
  generated from the same config as the hook so the two cannot disagree.
- **Runtime token overrides.** Apply a partial token map to an element and get a cleanup
  that restores exactly what was there.
- **Seeded themes.** A whole theme derived from two seed colours, in plain CSS that works
  in any build pipeline.

## Non-goals

- Tenant themes or any second brand palette in this package.
- A nested light scope inside a dark one for `dark:` utilities. Tokens re-scope correctly;
  `dark:` still matches a descendant of a dark ancestor. Documented, not solved.
- Changing any token value in the default light or dark theme.
- Framework adapters (Next.js cookies, server-read themes). The script covers first paint.
- Running the story accessibility suite in dark or high contrast. Follow-up.

## How the selector becomes a choice

Verified with a compile spike against Tailwind 4.3.5 before this was written:

1. A token set is a Tailwind `@utility` whose body is custom-property declarations.
   `@apply theme-tilli-dark;` inside any rule emits those declarations under that rule's
   selector. The utility is also usable as a class in markup, which gives subtree scoping
   for free.
2. A later `@custom-variant dark (...)` replaces an earlier one, so a consumer can
   redefine `dark:` after importing the package sheet.

So `src/styles/core.css` holds everything selector-free (Tailwind imports, `@theme
inline`, token utilities, base layer, keyframes, the default variants), and `styles.css`
becomes the core plus the default wiring. A consumer with their own selector imports
`@tilli.dev/ui-atoms/styles/core.css` and writes:

```css
@custom-variant dark (&:where(.dark, .dark *));
:root { @apply theme-tilli-light; }
.dark { @apply theme-tilli-dark; }
```

## Runtime design

- **The attribute is the state.** The store reads the resolved theme from the DOM and the
  preference from storage. It never holds a copy that can drift. Anything else that sets
  the attribute (the pre-paint script, devtools, another library) is picked up through a
  `MutationObserver`.
- **One config, shared.** `defineThemeConfig()` fills defaults; the store, the hook and
  `getThemeScript()` all take the same object. The attribute may be `data-*` or `class`,
  and each state's written value is configurable, so the runtime follows whatever
  selector the consumer chose in CSS.
- **Preference and resolution are separate fields.** `theme` is what the user chose
  (`light | dark | system`); `resolvedTheme` is what is showing (`light | dark`). The
  source implementation returned `system-light` as `theme` after choosing `system`.
- **No provider required.** `useTheme()` subscribes through `useSyncExternalStore` to a
  default store. `ThemeProvider` exists only to supply a non-default config or target.
- **Failure is quiet.** Storage that throws, a missing `matchMedia`, a stored value that
  is not a known preference: the attribute is still applied and nothing throws.

## Fixes relative to the source implementation

- Token overrides are restored on cleanup (the source restored attributes only).
- No scan of `document.styleSheets` (it throws on cross-origin sheets); named custom
  themes defined in CSS are a selector plus `@apply`, which the consumer already owns.
- Storage access is guarded.
- No `document` read during render; the server snapshot is the configured default.
- The script is inlined with a `nonce` prop, not served from the app's `public/`.
- Site-specific parts are dropped: the control-panel hook and `data-panel`.

## Seeded themes

The author's site derives every token from two seeds with `color-mix(in oklch, …)` and
picks per-mode values with `light-dark()`, including for the mix percentages
(`var(--background) light-dark(97%, 96%)`). That last use is not valid CSS: natively
`light-dark()` accepts colours only, and a browser drops the declaration. It works on
the site only because Next.js runs Lightning CSS, which rewrites `light-dark()` into a
pair of toggle variables, and that rewrite happens to work for any value.

This package makes the toggles explicit, so nothing depends on a build tool:

- `theme-mode-light` sets `--theme-light: initial; --theme-dark: ;` and
  `color-scheme: light`; `theme-mode-dark` sets the reverse. A property set to `initial`
  makes `var(--x, fallback)` yield its fallback; a property set to an empty value makes it
  yield nothing. So `var(--theme-light, 97%) var(--theme-dark, 96%)` is `97%` in light
  and `96%` in dark, for any value type.
- `theme-seeded` declares every colour token as a function of `--seed-primary` and
  `--seed-background`, using those toggles for per-mode amounts.

Verified before writing: the utilities compile through Tailwind 4.3.5 in development and
through its production optimiser with the empty-valued toggles intact, and resolve
correctly in Chromium, including a light scope nested inside a dark one.

Two consequences of how custom properties resolve, both documented for consumers:

- A derived token is computed on the element that declares it. `theme-seeded` must be
  applied on every element where the mode or a seed changes, not once on `:root`.
- Derived borders and inputs are translucent (`color-mix(…, transparent)`), unlike the
  default theme's solid ones. That is intended: it is what lets one formula serve any
  background.

The mode utilities follow the consumer's selector like every other token utility, which
`light-dark()` cannot: it follows `color-scheme`, which a consumer's own selector may
never set.

## High-contrast tokens

Three tokens change, reusing values the sheet already has so no new colour is invented:

| Token | Light, high contrast | Dark, high contrast |
|---|---|---|
| `--muted-foreground` | the light `--foreground` value | the dark `--foreground` value |
| `--border` | the light `--muted-foreground` value | the dark `--muted-foreground` value |
| `--input` | same as `--border` | same as `--border` |

## Release shape

Minor. Everything is additive: `styles.css` resolves to the same declarations for `:root`
and `[data-theme="dark"]` as in 1.1.0, plus new selectors and the two mode toggles. New
exports: `./theme`, `./styles/core.css`.
