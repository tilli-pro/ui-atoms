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
are Tailwind utilities (`theme-neutral-light`, `theme-neutral-dark` for the default theme), so a consumer who themes with
their own selector imports the core and writes:

```css
@custom-variant dark (&:where(.dark, .dark *));
:root { @apply theme-neutral-light theme-mode-light; }
.dark { @apply theme-neutral-dark theme-mode-dark; }
```

Each utility is also usable as a class to theme a subtree.

New `data-theme` values: `system` follows the OS in CSS alone; `system-light` and `system-dark`
are what the runtime writes while following it. `dark:` matches `system` when the OS is dark.

High contrast: `data-contrast` (`normal`, `high`, `system`, `system-normal`, `system-high`), a
`high-contrast:` variant, and the `theme-neutral-contrast-light` / `theme-neutral-contrast-dark`
utilities. High contrast gives muted text the foreground colour and gives borders and inputs
the muted-text colour.

Seeded themes: `theme-seeded` derives every colour token from `--seed-primary` and
`--seed-background` with `color-mix()`; status and chart colours keep the default theme's
values. `theme-mode-light` and `theme-mode-dark` set `color-scheme` and the `--theme-light` /
`--theme-dark` toggles, which let any CSS pick a value per mode:
`var(--theme-light, 97%) var(--theme-dark, 90%)`.

The tilli theme: `./styles/tilli.css` is the brand's own palette on the same selectors (import it
instead of `styles.css`), built from the `theme-tilli-light` / `theme-tilli-dark` token sets. One
blue carries actions and information, greys are tinted to match the wordmark, and the focus ring
is blue.

The beacon theme: `./styles/beacon.css` (token sets `theme-beacon-light` / `theme-beacon-dark`) is
the tilli theme plus a six-colour spectrum for telling an application's sections apart. Each
colour has four tokens, `--spectrum-N`, `--spectrum-N-to`, `--spectrum-N-contrast` and
`--spectrum-N-foreground` (classes `bg-spectrum-1`, `text-spectrum-1-contrast`, …). The hues are at
least 40 degrees apart and stay clear of the brand blue.

Brand colour: three new tokens in every theme, `--brand`, `--brand-foreground` and
`--brand-illustration` (classes `bg-brand`, `text-brand-foreground`, …), and a `brand` variant on
`Button`. `--primary` stays neutral. `THEME_TOKENS` gains `brand`, `brandForeground` and
`brandIllustration`.

Colour values are now held to one standard: `oklch(L C H)` with at most four decimals of
lightness and chroma and two of hue, and inside sRGB so each has an exact hex. **This changes
some default values for existing consumers of `styles.css`:**

- The status colours (`--destructive`, `--success`, `--warning`, `--info` and their
  `-foreground` pairs), the five chart colours and the dark `--sidebar-primary` were outside
  sRGB or carried a third hue decimal. Each keeps its lightness and hue; chroma is lowered to
  the most sRGB can show. The visible shift is small (for example destructive `#E7000B` →
  `#E30117`).
- The dark theme now sets `--background-secondary` (to the dark `--muted` value). It never did,
  so it kept the light value in dark mode.
- Greys, `--primary`, borders and every other token are unchanged.

The light and dark rules also gain the two toggle properties and `color-scheme`, so in the dark
theme native scrollbars and unstyled native form controls now render dark.

`--radius` is now declared on `:root` only. In 1.1.0 it was also re-declared on
`[data-theme="light"]` and `[data-theme="system-light"]`, so a light scope reset a `--radius`
overridden on an ancestor back to the default. It now inherits the ancestor's value like any
other custom property. If you relied on the reset, set `--radius` on the light scope yourself.
