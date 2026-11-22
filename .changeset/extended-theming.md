---
"@tilli.dev/ui-atoms": minor
---

Extended theming: an opt-in runtime, a theming selector of your choosing, high contrast, and
themes derived from two colours.

New `./theme`:

- `useTheme()` returns `theme` (the choice: `light | dark | system`), `resolvedTheme`
  (`light | dark`), `contrast`, `resolvedContrast`, `setTheme` and `setContrast`. It needs no
  provider, persists to `localStorage`, syncs across tabs and follows the OS for `system`.
- `ThemeScript` (and `getThemeScript()` for non-React shells) applies the stored theme before
  first paint. It is generated from the same config as the hook and takes a `nonce`.
- `ThemeProvider` is optional: it supplies a non-default config (`defineThemeConfig`) or themes
  an element other than `<html>`. `attribute` may be any `data-*` name or `"class"`, and the
  value written for each state is configurable.
- `createThemeStore` / `defaultThemeStore` for use outside React.
- `useCustomTheme(tokens)` and `applyThemeTokens(tokens, element)` override tokens at runtime
  and restore exactly what was there; `THEME_TOKENS` and `tokenToCssVariable` describe the set.
- `applyThemeSeeds({ primary, background }, element)` sets the seeds of a seeded theme.

New `./styles/core.css`: everything in `styles.css` with no selector attached. The token sets
are Tailwind utilities (`theme-tilli-light`, `theme-tilli-dark`), so a consumer who themes with
their own selector imports the core and writes:

```css
@custom-variant dark (&:where(.dark, .dark *));
:root { @apply theme-tilli-light theme-mode-light; }
.dark { @apply theme-tilli-dark theme-mode-dark; }
```

Each utility is also usable as a class to theme a subtree.

New `data-theme` values: `system` follows the OS in CSS alone; `system-light` and `system-dark`
are what the runtime writes while following it. `dark:` matches `system` when the OS is dark.

High contrast: `data-contrast` (`normal`, `high`, `system`, `system-normal`, `system-high`), a
`high-contrast:` variant, and the `theme-tilli-contrast-light` / `theme-tilli-contrast-dark`
utilities. High contrast gives muted text the foreground colour and gives borders and inputs
the muted-text colour.

Seeded themes: `theme-seeded` derives every colour token from `--seed-primary` and
`--seed-background` with `color-mix()`; status and chart colours keep the default theme's
values. `theme-mode-light` and `theme-mode-dark` set `color-scheme` and the `--theme-light` /
`--theme-dark` toggles, which let any CSS pick a value per mode:
`var(--theme-light, 97%) var(--theme-dark, 90%)`.

For existing consumers of `styles.css`, no token value changes. The light and dark rules gain
the two toggle properties and `color-scheme`, so in the dark theme native scrollbars and
unstyled native form controls now render dark.

`--radius` is now declared on `:root` only. In 1.1.0 it was also re-declared on
`[data-theme="light"]` and `[data-theme="system-light"]`, so a light scope reset a `--radius`
overridden on an ancestor back to the default. It now inherits the ancestor's value like any
other custom property. If you relied on the reset, set `--radius` on the light scope yourself.
