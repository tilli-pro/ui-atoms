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
  React.useLayoutEffect(() => {
    if (key === "") return;
    const entries = JSON.parse(key) as [string, string][];
    return applyThemeTokens(
      Object.fromEntries(entries) as ThemeTokens,
      target?.current ?? document.documentElement,
    );
  }, [key, target]);
}
