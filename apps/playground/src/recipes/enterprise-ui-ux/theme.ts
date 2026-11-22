import type { SectionKey } from "./modules.js";

/** Width of the whole nested sidebar: the icon rail plus a regular 14rem sidebar. */
export const NESTED_SIDEBAR_WIDTH =
  "calc(var(--sidebar-width-icon) + 1px + 14rem)";

/** Join class fragments; none of these overlap, so no merge is needed. */
export const classes = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export type Gradient = { from: string; to: string };

/**
 * Which colour of the beacon theme's spectrum each section wears. The spectrum lives in
 * ui-atoms (`theme-beacon-light` / `theme-beacon-dark`): six hues at least 40 degrees
 * apart, clear of the brand blue, each with a fill, a gradient end, a contrast colour for
 * what sits on the fill, and a foreground for text.
 */
export const sectionSpectrum: Record<SectionKey, 1 | 2 | 3 | 4 | 5 | 6> = {
  network: 6, // cyan
  engage: 2, // pink
  sales: 3, // orange
  finance: 5, // green
  operations: 1, // violet
  support: 4, // yellow
};

/**
 * Default gradient per section: its spectrum colour running to that colour's gradient
 * end. Any CSS color string works here and in the control panel.
 */
export const defaultGradients = Object.fromEntries(
  Object.entries(sectionSpectrum).map(([key, n]) => [
    key,
    { from: `var(--spectrum-${n})`, to: `var(--spectrum-${n}-to)` },
  ]),
) as Record<SectionKey, Gradient>;

/**
 * The inline custom properties a colourful section element needs: its gradient stops, and
 * `--on`, the colour for an icon on the full gradient. `--on` comes from the spectrum, so
 * a light fill (yellow, green) gets a dark icon instead of an unreadable white one.
 */
export const sectionStyle = (
  key: SectionKey,
  gradient: Gradient,
): Record<string, string> => ({
  "--from": gradient.from,
  "--to": gradient.to,
  "--on": `var(--spectrum-${sectionSpectrum[key]}-contrast)`,
  "--ink": sectionInk(key),
});

/** The section's colour as text or an icon stroke on a surface, readable in both modes. */
export const sectionInk = (key: SectionKey): string =>
  `var(--spectrum-${sectionSpectrum[key]}-foreground)`;

/** True for anything the browser accepts as a color: hex, hsl(), oklch(), oklab(), names… */
export const isCssColor = (value: string): boolean =>
  typeof CSS === "undefined" || typeof CSS.supports !== "function"
    ? value.trim().length > 0
    : CSS.supports("color", value.trim());

/**
 * Colorful rail items: a faint tint of the section gradient behind a stroke in the
 * section's foreground colour (`--ink`, from the spectrum). The active item shows the full gradient
 * with a stroke in the section's contrast colour (`--on`). `--from`/`--to` are set inline per item.
 */
export const colorfulItemClassName = classes(
  "bg-[linear-gradient(135deg,color-mix(in_oklab,var(--from)_20%,transparent),color-mix(in_oklab,var(--to)_8%,transparent))]",
  "[&>svg]:text-(--ink)",
  "data-[active=true]:bg-[linear-gradient(135deg,var(--from),var(--to))] data-[active=true]:[&>svg]:text-(--on,white)",
);

/** Section menu header: the group label (already text-xs) in unselectable uppercase foreground text. */
export const menuHeaderClassName = "select-none text-foreground uppercase";

/**
 * Colorful header text: the section's foreground colour. Reads the
 * `--ink` set inline on the popup, since the portaled popup inherits nothing
 * from the rail button.
 */
export const colorfulMenuHeaderClassName = "text-(--ink)";

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
