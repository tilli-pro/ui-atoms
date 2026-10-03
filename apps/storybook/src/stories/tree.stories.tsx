import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tree } from "@tilli.dev/ui-atoms/tree";

const meta = {
  title: "Components/Tree",
  component: Tree,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <p style={{ color: "var(--muted-foreground)" }}>
      Tree requires @headless-tree/core integration. See package docs.
    </p>
  ),
};
