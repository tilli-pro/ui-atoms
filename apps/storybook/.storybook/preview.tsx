import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import { defaultThemeStore } from "@tilli.dev/ui-atoms/theme";
import "../src/styles/globals.css";

/**
 * The toolbar globals drive the package's own theme store, so the Storybook exercises the
 * same code a consumer's toggle does. The store writes data-theme / data-contrast on <html>.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";
  const contrast = context.globals.contrast === "high" ? "high" : "normal";
  useEffect(() => {
    defaultThemeStore.setTheme(theme);
  }, [theme]);
  useEffect(() => {
    defaultThemeStore.setContrast(contrast);
  }, [contrast]);
  return <Story />;
};

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Color theme",
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
  initialGlobals: { theme: "light", contrast: "normal" },
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
