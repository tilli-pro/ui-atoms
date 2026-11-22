# @tilli.dev/themes

Themes for [`@tilli.dev/ui-atoms`](https://www.npmjs.com/package/@tilli.dev/ui-atoms). The
default theme in ui-atoms is neutral; this package adds two more.

- Documentation: https://tilli-pro.github.io/ui-atoms/storybook/ (the Theming page)

## Install

    pnpm add @tilli.dev/themes

It needs `@tilli.dev/ui-atoms` 1.2 or later and Tailwind CSS v4, which you already have if you
use ui-atoms.

## Use

Import one theme **instead of** `@tilli.dev/ui-atoms/styles.css`:

    @import "tailwindcss";
    @import "@tilli.dev/themes/tilli.css";
    @source "../node_modules/@tilli.dev/ui-atoms/dist";

Nothing else changes: `data-theme`, `data-contrast` and the `@tilli.dev/ui-atoms/theme` runtime
work as they do with the default theme.

| Theme | Stylesheet | What it is |
|---|---|---|
| tilli | `@tilli.dev/themes/tilli.css` | The tilli brand palette: one blue for actions and information, greys tinted to match the wordmark. |
| beacon | `@tilli.dev/themes/beacon.css` | The tilli theme plus a six-colour spectrum for telling an application's sections apart. |

### The beacon spectrum

Six colours: violet, pink, orange, yellow, green, cyan. Each has four tokens, shown here for
green:

| Token | Use | Class |
|---|---|---|
| `--spectrum-green` | The fill | `bg-spectrum-green` |
| `--spectrum-green-to` | The far end of its gradient | `to-spectrum-green-to` |
| `--spectrum-green-contrast` | Text and icons on the fill | `text-spectrum-green-contrast` |
| `--spectrum-green-foreground` | The colour as text on a surface | `text-spectrum-green-foreground` |

Use the contrast token on a fill, not white: four of the six fills are light and take dark
text. The spectrum is for identity, never state; success, warning and error have their own
tokens.

## Your own selector

To theme with a selector other than `data-theme`, import ui-atoms' core sheet and a theme's
token sets, then apply them yourself:

    @import "@tilli.dev/ui-atoms/styles/core.css";
    @import "@tilli.dev/themes/tilli/tokens.css";

    @custom-variant dark (&:where(.dark, .dark *));
    :root { @apply theme-tilli-light theme-mode-light; }
    .dark { @apply theme-tilli-dark theme-mode-dark; }

Each token set also works as a class, to theme one subtree.

## Licence

MIT.
