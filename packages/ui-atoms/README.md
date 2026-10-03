# @tilli.dev/ui-atoms

Documentation and live examples: https://tilli-pro.github.io/ui-atoms/

## Install

pnpm add @tilli.dev/ui-atoms @base-ui/react react react-dom tailwindcss

Optional peers, one per subpath — install only what you import:

| subpath | install |
|---|---|
| `./carousel` | `embla-carousel-react` |
| `./calendar` | `@daypicker/react` |
| `./number-ticker`, `./spinning-text` | `motion` |
| `./resizable` | `react-resizable-panels` |
| `./tree` | `@headless-tree/core` |

`./currency-input`, `./drawer`, `./command` and `./otp-field` need no optional peer: they are
built on `@base-ui/react`, which is already a required peer.

An absent optional peer surfaces as your bundler's module-not-found error naming that
package; nothing is swallowed.

## Styles (Tailwind v4)

Your Tailwind entry css needs the package's sheet and its class strings in scan scope:

    @import "tailwindcss";
    @import "@tilli.dev/ui-atoms/styles.css";
    @source "../node_modules/@tilli.dev/ui-atoms/dist";

Fonts are consumer-provided CSS variables: `--font-header`, `--font-body`,
`--font-mono`, optional `--font-button`.

## Usage

    import { Button } from "@tilli.dev/ui-atoms/button";
    import { Dialog, DialogTrigger, DialogPopup, DialogTitle } from "@tilli.dev/ui-atoms/dialog";
    import { cn } from "@tilli.dev/ui-atoms/utils";

Every part comes in three flavours: `DialogPopup` (styled), `DialogPopupPrimitive`
(behaviour + `data-slot`, unstyled) and `dialogPopupVariants` (the cva variants object).

## Components without an upstream counterpart

Most components track the coss registry at a pinned revision. These do not, and the
divergence is deliberate rather than drift — a future audit should not re-open them:

| subpath | why it diverges |
|---|---|
| `./resizable` | no coss counterpart; built on `react-resizable-panels` |
| `./carousel` | no coss counterpart; built on `embla-carousel-react` |
| `./number-ticker` | no coss counterpart; built on `motion` |
| `./aspect-ratio` | no coss counterpart; re-authored on base-ui `useRender` |
| `./currency-input` | no coss counterpart; a currency preset of `./number-field` — the Base UI root's own `format` + `locale` |
| `./segmented-control`, `./spinning-text`, `./stepper`, `./timeline`, `./tree`, `./form-root-error` | no coss counterpart |
| `./breadcrumb`, `./collapsible`, `./kbd`, `./meter`, `./progress` | ours is kept over upstream's (accessibility and radius-token fixes) |
| `./calendar` | coss's calendar plus an optional 24-hour time field (`showTime`, `CalendarTime`); no upstream component ships one, so it follows coss's `p-calendar-25` particle |

