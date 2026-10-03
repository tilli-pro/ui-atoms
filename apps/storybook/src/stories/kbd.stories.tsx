import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd, KbdGroup } from "@tilli.dev/ui-atoms/kbd";

const meta = {
  title: "Components/KBD",
  component: Kbd,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => <Kbd>⌘</Kbd>,
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>C</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>V</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
    </div>
  ),
};
