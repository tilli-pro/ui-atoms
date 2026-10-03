import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberTicker } from "@tilli.dev/ui-atoms/number-ticker";

const meta = {
  title: "Components/NumberTicker",
  component: NumberTicker,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "number" } },
    startValue: { control: { type: "number" } },
    decimalPlaces: { control: { type: "number", min: 0, max: 6, step: 1 } },
    direction: {
      control: "select",
      options: ["up", "down"],
    },
  },
} satisfies Meta<typeof NumberTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 1234, decimalPlaces: 0, direction: "up" },
};

export const WithDecimals: Story = {
  args: { value: 99.99, decimalPlaces: 2 },
};

export const CountDown: Story = {
  args: { value: 0, startValue: 100, direction: "down" },
};

export const LargeNumber: Story = {
  args: { value: 1000000, direction: "up" },
};

export const Percentage: Story = {
  args: { value: 87.5, decimalPlaces: 1, direction: "up" },
};
