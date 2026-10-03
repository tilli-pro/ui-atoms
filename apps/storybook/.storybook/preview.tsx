import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) || "light";
  useEffect(() => {
    if (theme === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
  }, [theme]);
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
  },
  initialGlobals: { theme: "light" },
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
