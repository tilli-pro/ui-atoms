import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import { Group, GroupSeparator } from "@tilli.dev/ui-atoms/group";

const meta = {
  title: "Components/Group",
  component: Group,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Group>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <Group orientation="horizontal">
      <Button variant="outline">Left</Button>
      <GroupSeparator />
      <Button variant="outline">Center</Button>
      <GroupSeparator />
      <Button variant="outline">Right</Button>
    </Group>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Group orientation="vertical">
      <Button variant="outline">Top</Button>
      <GroupSeparator />
      <Button variant="outline">Bottom</Button>
    </Group>
  ),
};
