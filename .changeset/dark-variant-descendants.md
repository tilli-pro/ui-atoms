---
"@tilli.dev/ui-atoms": patch
---

`dark:` utilities now apply inside a dark theme. The variant in `styles.css` was defined as
`&:is([data-theme="dark"])`, which matches only the element that carries the attribute, so
with `data-theme="dark"` on `<html>` none of the `dark:` classes in any component took
effect; dark mode looked mostly right only because the colour tokens swap through CSS
variables. It is now `&:where([data-theme="dark"], [data-theme="dark"] *)`.

Visible in dark mode: inputs, textareas, selects and similar fields get their translucent
`input` background, popups and cards get their top highlight instead of the light theme's
bottom shadow, the tabs indicator and segmented surfaces use `input`, and focus rings and
invalid states use their dark values. Light mode is unchanged. If you worked around this by
restating `dark:` styles under your own selector, those overrides can go.

`data-theme="system-dark"` is accepted as a second dark value, for both the `dark:` variant
and the dark tokens. It is what a theme script writes when the user has made no choice and
the OS is dark, so a page can tell a followed preference from an explicit one.
