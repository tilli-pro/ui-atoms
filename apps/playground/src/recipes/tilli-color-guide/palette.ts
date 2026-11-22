import { type Oklch, oklch } from "./color.js";

export interface Step {
  step: string;
  color: Oklch;
  note?: string;
}

/** The hue of the blue stroke of the U mark. Every blue step shares it. */
const BLUE_HUE = 266.12;
/** The hue of the cyan stroke of the U mark. */
const CYAN_HUE = 238.87;
/** A faint blue cast, so greys sit in the same family as the mark. */
const NEUTRAL_HUE = 258;

export const blue = {
  50: oklch(0.97, 0.013, BLUE_HUE),
  100: oklch(0.93, 0.032, BLUE_HUE),
  200: oklch(0.87, 0.062, BLUE_HUE),
  300: oklch(0.79, 0.104, BLUE_HUE),
  400: oklch(0.68, 0.166, BLUE_HUE),
  500: oklch(0.5502, 0.2319, BLUE_HUE),
  600: oklch(0.47, 0.22, BLUE_HUE),
  700: oklch(0.4, 0.19, BLUE_HUE),
  800: oklch(0.32, 0.15, BLUE_HUE),
  900: oklch(0.25, 0.11, BLUE_HUE),
  950: oklch(0.18, 0.075, BLUE_HUE),
} as const;

export const neutral = {
  0: oklch(1, 0, 0),
  50: oklch(0.985, 0.004, NEUTRAL_HUE),
  100: oklch(0.965, 0.007, NEUTRAL_HUE),
  200: oklch(0.925, 0.012, NEUTRAL_HUE),
  300: oklch(0.87, 0.014, NEUTRAL_HUE),
  400: oklch(0.72, 0.016, NEUTRAL_HUE),
  500: oklch(0.53, 0.018, NEUTRAL_HUE),
  600: oklch(0.44, 0.018, NEUTRAL_HUE),
  700: oklch(0.35, 0.018, NEUTRAL_HUE),
  800: oklch(0.26, 0.016, NEUTRAL_HUE),
  900: oklch(0.19, 0.014, NEUTRAL_HUE),
  950: oklch(0.145, 0.012, NEUTRAL_HUE),
} as const;

/** Illustration and gradient colour only: never a fill behind text, never text on light. */
export const cyan = {
  200: oklch(0.9, 0.054, CYAN_HUE),
  400: oklch(0.7232, 0.1623, CYAN_HUE),
  600: oklch(0.56, 0.125, CYAN_HUE),
} as const;

/**
 * Lightness and hue are ui-atoms' status colours; chroma is lowered to the most sRGB can
 * show at that lightness and hue. The library's own values sit outside sRGB, so their hex
 * was a clipped approximation.
 */
export const status = {
  destructive: oklch(0.577, 0.235, 27.33),
  destructiveInk: oklch(0.5, 0.204, 27.33),
  // Lighter than ui-atoms' 0.637: on a destructive tint over the dark card that measured 4.48:1.
  destructiveInkDark: oklch(0.7, 0.18, 25.33),
  success: oklch(0.696, 0.151, 162.48),
  successInk: oklch(0.508, 0.106, 165.61),
  successInkDark: oklch(0.765, 0.164, 163.22),
  warning: oklch(0.769, 0.166, 70.08),
  warningInk: oklch(0.555, 0.149, 49),
  warningInkDark: oklch(0.828, 0.169, 84.43),
} as const;

const steps = <T extends Record<string, Oklch>>(
  ramp: T,
  notes: Partial<Record<keyof T, string>> = {},
): Step[] =>
  Object.entries(ramp).map(([step, color]) => {
    const note = notes[step as keyof T];
    return note ? { step, color, note } : { step, color };
  });

export const blueSteps = steps(blue, {
  100: "Tinted surface, light",
  400: "Brand text, dark",
  500: "The brand fill. The U mark.",
  600: "Hover and pressed, light",
  900: "Tinted surface, dark",
});

export const neutralSteps = steps(neutral, {
  0: "Card, light",
  50: "Page, light",
  200: "Border, light. Wordmark on dark.",
  500: "Muted text, light",
  400: "Muted text, dark",
  900: "Card, dark",
  950: "Page, dark. Wordmark on light.",
});

export const cyanSteps = steps(cyan, {
  400: "The U mark. Illustration and gradients.",
});

export type Mode = "light" | "dark";

export interface Token {
  /** The CSS custom property, without the leading dashes. */
  name: string;
  role: string;
  light: Oklch;
  dark: Oklch;
  /** A token ui-atoms does not have yet. */
  proposed?: boolean;
}

const token = (
  name: string,
  role: string,
  light: Oklch,
  dark: Oklch,
  proposed = false,
): Token =>
  proposed
    ? { name, role, light, dark, proposed }
    : { name, role, light, dark };

export const tokens: Token[] = [
  token("background", "The page", neutral[50], neutral[950]),
  token("foreground", "Body text", neutral[950], neutral[100]),
  token("card", "Raised surfaces", neutral[0], neutral[900]),
  token("card-foreground", "Text on a card", neutral[950], neutral[100]),
  token("popover", "Menus and popups", neutral[0], neutral[900]),
  token("popover-foreground", "Text in a popup", neutral[950], neutral[100]),
  token("muted", "Quiet surfaces", neutral[100], neutral[800]),
  token("muted-foreground", "Secondary text", neutral[500], neutral[400]),
  token("secondary", "Secondary controls", neutral[100], neutral[800]),
  token(
    "secondary-foreground",
    "Text on secondary",
    neutral[900],
    neutral[100],
  ),
  token("accent", "Hover surfaces", neutral[100], neutral[800]),
  token("accent-foreground", "Text on hover", neutral[900], neutral[100]),
  token("border", "Dividers and outlines", neutral[200], neutral[800]),
  token("input", "Field outlines", neutral[200], neutral[800]),
  token("ring", "Focus ring", blue[500], blue[400]),
  token("primary", "Default solid controls", neutral[900], neutral[100]),
  token("primary-foreground", "Text on primary", neutral[50], neutral[900]),
  token("brand", "The one blue action per view", blue[500], blue[500], true),
  token(
    "brand-foreground",
    "Brand-coloured text and icons",
    blue[500],
    blue[400],
    true,
  ),
  token(
    "brand-illustration",
    "Illustration and gradients only",
    cyan[400],
    cyan[400],
    true,
  ),
  token("info", "Informational fills and tints", blue[500], blue[500]),
  token("info-foreground", "Informational text", blue[600], blue[300]),
  token(
    "destructive",
    "Destructive fills",
    status.destructive,
    status.destructive,
  ),
  token(
    "destructive-foreground",
    "Destructive text",
    status.destructiveInk,
    status.destructiveInkDark,
  ),
  token("success", "Success fills and tints", status.success, status.success),
  token(
    "success-foreground",
    "Success text",
    status.successInk,
    status.successInkDark,
  ),
  token("warning", "Warning fills and tints", status.warning, status.warning),
  token(
    "warning-foreground",
    "Warning text",
    status.warningInk,
    status.warningInkDark,
  ),
];

/** Colours in use today that the guide retires, with what replaces each. */
export const retired: { hex: string; where: string; use: string }[] = [
  { hex: "#00b1ff", where: "Current site cyan", use: "cyan 400" },
  { hex: "#33c1ff", where: "Rebuild cyan", use: "cyan 400" },
  { hex: "#1447e6", where: "Rebuild dark sidebar, chart", use: "blue 500" },
  { hex: "#3080ff", where: "Info blue", use: "blue 500" },
  { hex: "#8b5cf6", where: "Current site purple", use: "nothing" },
  { hex: "#6366f1", where: "Current site indigo", use: "nothing" },
];
