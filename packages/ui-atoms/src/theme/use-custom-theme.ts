"use client";

import * as React from "react";
import { applyThemeTokens, type ThemeTokens } from "./tokens.js";

export interface UseCustomThemeOptions {
  /** Apply to this element instead of `<html>`. */
  target?: React.RefObject<HTMLElement | null> | undefined;
}

/** A value-based identity for a token map, independent of key order. */
function serialise(tokens: ThemeTokens | undefined): string {
  if (!tokens) return "";
  return JSON.stringify(
    Object.entries(tokens).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

/**
 * Overrides theme tokens for as long as the calling component is mounted, then restores
 * what was there. Token maps are compared by value, so an inline object literal does not
 * re-apply on every render.
 */
export function useCustomTheme(
  tokens: ThemeTokens | undefined,
  options: UseCustomThemeOptions = {},
): void {
  const { target } = options;
  const key = serialise(tokens);
  // Without a target the override goes on <html> before paint. With one, it waits for a
  // passive effect: a ref attached by an ancestor is still null during this component's
  // layout effects, and a scoped override must never land on <html> instead.
  React.useLayoutEffect(() => {
    if (key === "" || target) return;
    return applyThemeTokens(parse(key));
  }, [key, target]);
  React.useEffect(() => {
    if (key === "" || !target?.current) return;
    return applyThemeTokens(parse(key), target.current);
  }, [key, target]);
}

function parse(key: string): ThemeTokens {
  return Object.fromEntries(JSON.parse(key) as [string, string][]);
}
