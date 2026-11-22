import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "@tilli.dev/ui-atoms/card";

const meta = {
  title: "Components/Spectrum",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The beacon theme's six spectrum colours, for telling sections of an application apart. Each has a fill, a gradient end, a contrast colour for text and icons on the fill, and a foreground for text on a surface. The classes below are written out in full so Tailwind generates them.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tailwind needs to see whole class names, so each colour's classes are spelled out. */
const SPECTRUM = [
  {
    name: "1 violet",
    fill: "bg-linear-to-br from-spectrum-1 to-spectrum-1-to text-spectrum-1-contrast",
    text: "text-spectrum-1-foreground",
    tint: "bg-spectrum-1/10",
  },
  {
    name: "2 pink",
    fill: "bg-linear-to-br from-spectrum-2 to-spectrum-2-to text-spectrum-2-contrast",
    text: "text-spectrum-2-foreground",
    tint: "bg-spectrum-2/10",
  },
  {
    name: "3 orange",
    fill: "bg-linear-to-br from-spectrum-3 to-spectrum-3-to text-spectrum-3-contrast",
    text: "text-spectrum-3-foreground",
    tint: "bg-spectrum-3/10",
  },
  {
    name: "4 yellow",
    fill: "bg-linear-to-br from-spectrum-4 to-spectrum-4-to text-spectrum-4-contrast",
    text: "text-spectrum-4-foreground",
    tint: "bg-spectrum-4/10",
  },
  {
    name: "5 green",
    fill: "bg-linear-to-br from-spectrum-5 to-spectrum-5-to text-spectrum-5-contrast",
    text: "text-spectrum-5-foreground",
    tint: "bg-spectrum-5/10",
  },
  {
    name: "6 cyan",
    fill: "bg-linear-to-br from-spectrum-6 to-spectrum-6-to text-spectrum-6-contrast",
    text: "text-spectrum-6-foreground",
    tint: "bg-spectrum-6/10",
  },
];

function Swatches({ mode }: { mode: "light" | "dark" }) {
  return (
    <div
      className={
        mode === "light"
          ? "theme-beacon-light theme-mode-light bg-background p-6 text-foreground"
          : "theme-beacon-dark theme-mode-dark bg-background p-6 text-foreground"
      }
    >
      <div className="grid grid-cols-3 gap-3">
        {SPECTRUM.map((color) => (
          <div
            className="flex w-36 flex-col overflow-hidden rounded-lg border bg-card"
            key={color.name}
          >
            <div
              className={`flex h-16 items-center justify-center font-medium text-sm ${color.fill}`}
            >
              {color.name}
            </div>
            <div
              className={`px-3 py-2 font-medium text-sm ${color.tint} ${color.text}`}
            >
              Section text
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const LightAndDark: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Swatches mode="light" />
      <Swatches mode="dark" />
    </div>
  ),
};
