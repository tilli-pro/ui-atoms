import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
} from "@tilli.dev/ui-atoms/toolbar";

const meta = {
  title: "Components/Toolbar",
  component: Toolbar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarLink href="#">Link</ToolbarLink>
      </ToolbarGroup>
    </Toolbar>
  ),
};
