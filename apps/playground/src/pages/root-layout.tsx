import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { ControlPanel, useControl } from "../control-panel/index.js";

/**
 * Wraps every page: the matched route plus the one shared control panel, and
 * the app-wide controls every recipe gets for free. Dark mode is purely a
 * Tailwind concern: `data-theme="dark"` on <html> swaps the ui-atoms tokens.
 */
/** The OS preference, used until a persisted panel value overrides it. */
const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export function RootLayout() {
  const [dark, setDark] = useState(prefersDark);

  useControl(
    {
      dark: {
        value: dark,
        persist: true,
        onChange: (v) => setDark(v === true),
      },
    },
    { group: "theme", collapsed: false, order: -100 },
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <>
      <Outlet />
      <ControlPanel />
    </>
  );
}
