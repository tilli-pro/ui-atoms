import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import { defaultThemeStore } from "@tilli.dev/ui-atoms/theme";
import "../src/styles/globals.css";
import beaconStyles from "../src/styles/beacon.css?inline";
import tilliStyles from "../src/styles/tilli.css?inline";

/** The built-in themes that are added on top of the neutral sheet, as stylesheet text. */
const THEME_SHEETS: Record<string, string> = {
  tilli: tilliStyles,
  beacon: beaconStyles,
};

/**
 * The toolbar globals drive the package's own theme store, so the Storybook exercises the
 * same code a consumer's toggle does. The store writes data-theme / data-contrast on <html>.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";
  const contrast = context.globals.contrast === "high" ? "high" : "normal";
  const palette = String(context.globals.palette ?? "neutral");
  useEffect(() => {
    defaultThemeStore.setTheme(theme);
  }, [theme]);
  useEffect(() => {
    defaultThemeStore.setContrast(contrast);
  }, [contrast]);
  // Both built-in themes answer to the same data-theme / data-contrast values, so
  // switching theme is switching stylesheet: the neutral one is always loaded, and the
  // others are added after it, where their rules win.
  useEffect(() => {
    const sheet = THEME_SHEETS[palette];
    if (!sheet) return;
    const style = document.createElement("style");
    style.setAttribute("data-palette", palette);
    style.textContent = sheet;
    document.head.append(style);
    return () => style.remove();
  }, [palette]);
  return <Story />;
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    palette: {
      name: "Theme",
      description: "Built-in theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "neutral", title: "Neutral theme" },
          { value: "tilli", title: "tilli theme" },
          { value: "beacon", title: "Beacon theme" },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      name: "Mode",
      description: "Light or dark",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    contrast: {
      name: "Contrast",
      description: "Contrast preference",
      toolbar: {
        icon: "accessibility",
        items: [
          { value: "normal", title: "Normal contrast" },
          { value: "high", title: "High contrast" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { palette: "neutral", theme: "light", contrast: "normal" },
  decorators: [withTheme],
  parameters: {
    options: {
      storySort: {
        order: [
          "Docs",
          [
            "Introduction",
            "Installation",
            "Styling and tokens",
            "Theming",
            "Accessibility",
          ],
          "Components",
        ],
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Failing axe: any violation fails the vitest story run.
    a11y: { test: "error" },
  },
};

export default preview;
