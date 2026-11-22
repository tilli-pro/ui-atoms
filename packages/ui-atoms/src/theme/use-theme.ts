"use client";

import * as React from "react";
import {
  defaultThemeStore,
  type ThemeState,
  type ThemeStore,
} from "./store.js";

/** The store a `ThemeProvider` supplies; `null` means "use the default store". */
export const ThemeStoreContext = React.createContext<ThemeStore | null>(null);

export type UseThemeResult = ThemeState &
  Pick<ThemeStore, "setTheme" | "setContrast">;

/**
 * The current theme and contrast, and setters for both. Needs no provider: without one it
 * reads and writes `<html>` with the default config. `theme` is what the user chose
 * (`light | dark | system`); `resolvedTheme` is what is showing.
 *
 * During server rendering and hydration it returns the configured defaults, then updates
 * to what the pre-paint script applied.
 */
export function useTheme(): UseThemeResult {
  const store = React.useContext(ThemeStoreContext) ?? defaultThemeStore;
  const state = React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return React.useMemo(
    () => ({
      ...state,
      setTheme: store.setTheme,
      setContrast: store.setContrast,
    }),
    [state, store],
  );
}
