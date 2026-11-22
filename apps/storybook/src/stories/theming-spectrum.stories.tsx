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
    name: "violet",
    fill: "bg-linear-to-br from-spectrum-violet to-spectrum-violet-to text-spectrum-violet-contrast",
    text: "text-spectrum-violet-foreground",
    tint: "bg-spectrum-violet/10",
  },
  {
    name: "pink",
    fill: "bg-linear-to-br from-spectrum-pink to-spectrum-pink-to text-spectrum-pink-contrast",
    text: "text-spectrum-pink-foreground",
    tint: "bg-spectrum-pink/10",
  },
  {
    name: "orange",
    fill: "bg-linear-to-br from-spectrum-orange to-spectrum-orange-to text-spectrum-orange-contrast",
    text: "text-spectrum-orange-foreground",
    tint: "bg-spectrum-orange/10",
  },
  {
    name: "yellow",
    fill: "bg-linear-to-br from-spectrum-yellow to-spectrum-yellow-to text-spectrum-yellow-contrast",
    text: "text-spectrum-yellow-foreground",
    tint: "bg-spectrum-yellow/10",
  },
  {
    name: "green",
    fill: "bg-linear-to-br from-spectrum-green to-spectrum-green-to text-spectrum-green-contrast",
    text: "text-spectrum-green-foreground",
    tint: "bg-spectrum-green/10",
  },
  {
    name: "cyan",
    fill: "bg-linear-to-br from-spectrum-cyan to-spectrum-cyan-to text-spectrum-cyan-contrast",
    text: "text-spectrum-cyan-foreground",
    tint: "bg-spectrum-cyan/10",
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
