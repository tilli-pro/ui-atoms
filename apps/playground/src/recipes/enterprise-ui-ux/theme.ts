import type { SectionKey } from "./modules.js";

/** Width of the whole nested sidebar: the icon rail plus a regular 14rem sidebar. */
export const NESTED_SIDEBAR_WIDTH =
  "calc(var(--sidebar-width-icon) + 1px + 14rem)";

/** Join class fragments; none of these overlap, so no merge is needed. */
export const classes = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export type Gradient = { from: string; to: string };

/**
 * Default gradient per section: the hue's most saturated in-gamut color, running
 * to a stop 40–55° around the wheel, rotated away from the neighbouring section.
 * Any CSS color string works here and in the control panel.
 */
export const defaultGradients: Record<SectionKey, Gradient> = {
  network: { from: "#0280f7", to: "#08c2ca" }, // h255 → h200
  engage: { from: "#fd0797", to: "#f95801" }, // h355 → h40
  sales: { from: "#fb8304", to: "#d0af07" }, // h55 → h95
  finance: { from: "#04cfa2", to: "#a3c003" }, // h170 → h120
  operations: { from: "#0a9fe0", to: "#5b5bf5" }, // h200 → h240
  support: { from: "#740bfe", to: "#fb02b8" }, // h290 → h345
};

/** True for anything the browser accepts as a color: hex, hsl(), oklch(), oklab(), names… */
export const isCssColor = (value: string): boolean =>
  typeof CSS === "undefined" || typeof CSS.supports !== "function"
    ? value.trim().length > 0
    : CSS.supports("color", value.trim());

/**
 * Colorful rail items: a faint tint of the section gradient behind a stroke
 * darkened from its first stop (`--section-ink-mix` in styles.css keeps the
 * stroke undarkened in dark mode). The active item shows the full gradient
 * with a white stroke. `--from`/`--to` are set inline per item.
 */
export const colorfulItemClassName = classes(
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--from)_20%,transparent),color-mix(in_oklab,var(--to)_8%,transparent))]",
  "[&>svg]:text-[color-mix(in_oklab,var(--from)_var(--section-ink-mix),black)]",
  "data-[active=true]:bg-[linear-gradient(135deg,var(--from),var(--to))] data-[active=true]:[&>svg]:text-white",
);

/** Section menu header: the group label (already text-xs) in unselectable uppercase foreground text. */
export const menuHeaderClassName = "select-none text-foreground uppercase";

/**
 * Colorful header text: the section's first stop pulled toward the theme ink
 * (`--section-heading-mix` / `--section-heading-ink` in styles.css). Reads the
 * `--from` set inline on the popup, since the portaled popup inherits nothing
 * from the rail button.
 */
export const colorfulMenuHeaderClassName =
  "text-[color-mix(in_oklab,var(--from)_var(--section-heading-mix),var(--section-heading-ink))]";

/**
 * Second-sidebar header for a colorful section: the same faint tint as its rail
 * item behind the heading-mix text. Enterprise and monochrome mode use the plain header.
 */
export const colorfulPanelHeaderClassName = classes(
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--from)_20%,transparent),color-mix(in_oklab,var(--to)_8%,transparent))]",
  colorfulMenuHeaderClassName,
);

/** The brand square in the rail header: solid primary, or outlined while Enterprise is the active module. */
export const brandSquareClassName =
  "flex aspect-square size-8 items-center justify-center rounded-lg";
export const brandSquareIdleClassName =
  "bg-sidebar-primary text-sidebar-primary-foreground";
export const brandSquareSelectedClassName =
  "bg-transparent text-sidebar-primary ring-2 ring-sidebar-ring ring-inset";

/** Monochrome rail items: no gradient; the active item is a solid primary fill. */
export const monochromeItemClassName =
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground";
