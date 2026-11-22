import {
  defaultThemeStore,
  isThemePreference,
  useTheme,
} from "@tilli.dev/ui-atoms/theme";
import { Outlet } from "react-router";
import { ControlPanel, useControl } from "../control-panel/index.js";
import { LEGACY_DARK_KEY, legacyDarkPreference } from "../legacy-theme.js";

/**
 * A visitor who chose dark or light with the old `dark` toggle keeps that choice: it is
 * handed to the theme store once, unless the store already has a preference of its own.
 */
function migrateLegacyTheme(): void {
  try {
    const legacy = legacyDarkPreference(
      window.localStorage.getItem(LEGACY_DARK_KEY),
    );
    window.localStorage.removeItem(LEGACY_DARK_KEY);
    if (legacy && window.localStorage.getItem("theme") === null)
      defaultThemeStore.setTheme(legacy);
  } catch {
    /* storage unavailable: nothing to migrate */
  }
}
if (typeof window !== "undefined") migrateLegacyTheme();

/**
 * Wraps every page: the matched route plus the one shared control panel, and
 * the app-wide controls every recipe gets for free. The theme control drives
 * `useTheme` from `@tilli.dev/ui-atoms/theme`, which owns the `data-theme`
 * attribute on <html>, persistence and following the OS for `system`.
 */
export function RootLayout() {
  const { theme, setTheme } = useTheme();

  useControl(
    {
      theme: {
        value: theme,
        options: ["system", "light", "dark"],
        onChange: (v) => {
          if (isThemePreference(v)) setTheme(v);
        },
      },
    },
    { group: "theme", collapsed: false, order: -100 },
  );

  return (
    <>
      <Outlet />
      <ControlPanel />
    </>
  );
}
