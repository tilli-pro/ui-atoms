---
"@tilli.dev/themes": major
---

First release: themes for `@tilli.dev/ui-atoms` 1.2 and later. Each is a stylesheet imported
instead of `@tilli.dev/ui-atoms/styles.css`, and each responds to the same `data-theme` and
`data-contrast` values as the default theme.

- `@tilli.dev/themes/tilli.css`: the tilli brand palette. One blue carries actions and
  information, greys are tinted to match the wordmark, and the focus ring is blue.
- `@tilli.dev/themes/beacon.css`: the tilli theme plus a spectrum for telling an application's
  sections apart: six hues (violet, pink, orange, yellow, green, cyan) and slate, a neutral. Each colour has
  four tokens: `--spectrum-<name>`, `-to`, `-contrast` and `-foreground`, with classes such as
  `bg-spectrum-green` and `text-spectrum-green-contrast`.
- `@tilli.dev/themes/tilli/tokens.css` and `@tilli.dev/themes/beacon/tokens.css`: the token sets
  alone (`theme-tilli-light`, `theme-beacon-dark`, …), for applying with your own selector
  after importing `@tilli.dev/ui-atoms/styles/core.css`.

Every value is `oklch(L C H)` inside sRGB, and both themes have high-contrast sets.
