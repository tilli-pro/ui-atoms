/**
 * The themeable colour tokens, by their camelCase names. `__tests__/theme/tokens.test.tsx`
 * compares this list with the custom properties of `theme-neutral-light` in
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
  "brand",
  "brandForeground",
  "brandIllustration",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemeTokens = Partial<Record<ThemeToken, string>>;

const KNOWN: ReadonlySet<string> = new Set(THEME_TOKENS);
const BOUNDARY = /[A-Z]|\d+/g;

/** `"mutedForeground"` → `"--muted-foreground"`, `"chart1"` → `"--chart-1"`. */
export function tokenToCssVariable(token: ThemeToken): `--${string}` {
  return `--${token.replace(BOUNDARY, (part) => `-${part.toLowerCase()}`)}`;
}

interface Layers {
  /** The inline value and priority from before the first override. */
  base: readonly [value: string, priority: string];
  /** Active overrides, oldest first; the last one is what the element shows. */
  active: { id: symbol; value: string }[];
}

const REGISTRY = new WeakMap<HTMLElement, Map<string, Layers>>();

/**
 * Sets inline custom properties on `target` (default `<html>`) and returns a function
 * that undoes it. Overrides of the same property on the same element stack: the latest
 * one shows, ending one reveals the one beneath, and ending the last restores exactly what
 * was there before any of them (a prior inline value with its priority, or nothing),
 * whatever order they end in.
 */
export function applyInlineProperties(
  properties: readonly (readonly [name: string, value: string])[],
  target: HTMLElement = document.documentElement,
): () => void {
  const id = Symbol("override");
  let perElement = REGISTRY.get(target);
  if (!perElement) {
    perElement = new Map();
    REGISTRY.set(target, perElement);
  }
  const names: string[] = [];
  for (const [name, value] of properties) {
    let layers = perElement.get(name);
    if (!layers) {
      layers = {
        base: [
          target.style.getPropertyValue(name),
          target.style.getPropertyPriority(name),
        ],
        active: [],
      };
      perElement.set(name, layers);
    }
    layers.active.push({ id, value });
    target.style.setProperty(name, value);
    names.push(name);
  }
  return () => {
    const registered = REGISTRY.get(target);
    if (!registered) return;
    for (const name of names) {
      const layers = registered.get(name);
      const index = layers?.active.findIndex((layer) => layer.id === id) ?? -1;
      if (!layers || index === -1) continue;
      const wasShowing = index === layers.active.length - 1;
      layers.active.splice(index, 1);
      const top = layers.active.at(-1);
      if (top) {
        if (wasShowing) target.style.setProperty(name, top.value);
        continue;
      }
      registered.delete(name);
      const [value, priority] = layers.base;
      if (value === "") target.style.removeProperty(name);
      else target.style.setProperty(name, value, priority);
    }
  };
}

/**
 * Sets the given tokens as inline custom properties on `target` (default `<html>`).
 * The returned function restores exactly what was there.
 */
export function applyThemeTokens(
  tokens: ThemeTokens,
  target?: HTMLElement,
): () => void {
  const properties: [string, string][] = [];
  for (const [token, value] of Object.entries(tokens))
    if (KNOWN.has(token) && typeof value === "string")
      properties.push([tokenToCssVariable(token as ThemeToken), value]);
  return applyInlineProperties(properties, target);
}
