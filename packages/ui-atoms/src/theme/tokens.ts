/**
 * The themeable colour tokens, by their camelCase names. `__tests__/theme/tokens.test.tsx`
 * compares this list with the custom properties of `theme-tilli-light` in
 * `styles/core.css`, so a token added to the sheet fails that test until it is added here.
 */
export const THEME_TOKENS = [
  "background",
  "backgroundSecondary",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "border",
  "input",
  "ring",
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
  "sidebar",
  "sidebarForeground",
  "sidebarPrimary",
  "sidebarPrimaryForeground",
  "sidebarAccent",
  "sidebarAccentForeground",
  "sidebarBorder",
  "sidebarRing",
  "info",
  "infoForeground",
  "success",
  "successForeground",
  "warning",
  "warningForeground",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemeTokens = Partial<Record<ThemeToken, string>>;

const KNOWN: ReadonlySet<string> = new Set(THEME_TOKENS);
const BOUNDARY = /[A-Z]|\d+/g;

/** `"mutedForeground"` → `"--muted-foreground"`, `"chart1"` → `"--chart-1"`. */
export function tokenToCssVariable(token: ThemeToken): `--${string}` {
  return `--${token.replace(BOUNDARY, (part) => `-${part.toLowerCase()}`)}`;
}

/**
 * Sets the given tokens as inline custom properties on `target` (default `<html>`).
 * The returned function restores exactly what was there: a property that had an inline
 * value gets it back, with its priority, and one that had none is removed.
 */
export function applyThemeTokens(
  tokens: ThemeTokens,
  target: HTMLElement = document.documentElement,
): () => void {
  const previous: [name: string, value: string, priority: string][] = [];
  for (const [token, value] of Object.entries(tokens)) {
    if (!KNOWN.has(token) || typeof value !== "string") continue;
    const name = tokenToCssVariable(token as ThemeToken);
    previous.push([
      name,
      target.style.getPropertyValue(name),
      target.style.getPropertyPriority(name),
    ]);
    target.style.setProperty(name, value);
  }
  return () => {
    for (const [name, value, priority] of previous) {
      if (value === "") target.style.removeProperty(name);
      else target.style.setProperty(name, value, priority);
    }
  };
}
