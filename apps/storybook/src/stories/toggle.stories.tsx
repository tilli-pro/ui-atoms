import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "@tilli.dev/ui-atoms/toggle";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Toggle",
    variant: "default",
    size: "default",
    disabled: false,
  },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      {(["default", "outline"] as const).map((variant) =>
        (["sm", "default", "lg"] as const).map((size) => (
          <Toggle key={`${variant}-${size}`} size={size} variant={variant}>
            {variant}/{size}
          </Toggle>
        )),
      )}
    </div>
  ),
};
