"use client";

import * as React from "react";
import { createThemeStore } from "./store.js";
import { ThemeStoreContext } from "./use-theme.js";
import type { ThemeConfigOverrides } from "./config.js";

export interface ThemeProviderProps {
  /**
   * Non-default theme config. Pass a stable reference (a module-level constant or a
   * memoised object): a new object creates a new store.
   */
  config?: ThemeConfigOverrides | undefined;
  /**
   * Scope the theme to an element instead of `<html>`. The element must be mounted when
   * the first `useTheme()` under this provider mounts; until it is, nothing is written.
   */
  target?: React.RefObject<HTMLElement | null> | undefined;
  children: React.ReactNode;
}

/**
 * Optional. `useTheme()` works without it; render one only to give a subtree a
 * non-default config or to theme an element other than `<html>`.
 */
export function ThemeProvider({
  config,
  target,
  children,
}: ThemeProviderProps): React.ReactElement {
  const store = React.useMemo(
    () =>
      createThemeStore(config, () =>
        target ? target.current : document.documentElement,
      ),
    [config, target],
  );
  return <ThemeStoreContext value={store}>{children}</ThemeStoreContext>;
}
