import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpinningText } from "@tilli.dev/ui-atoms/spinning-text";

const meta = {
  title: "Components/SpinningText",
  component: SpinningText,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  // The ring is absolutely positioned around its centre, so give it room.
  decorators: [
    (Story) => (
      <div className="flex size-48 items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpinningText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "secure payments • fast payouts • " },
};

export const Reverse: Story = {
  args: { children: "secure payments • fast payouts • ", reverse: true },
};

export const Slow: Story = {
  args: { children: "secure payments • fast payouts • ", duration: 30 },
};

export const LargeRadius: Story = {
  args: {
    children: "secure payments • fast payouts • always on • ",
    radius: 8,
  },
};

export const Styled: Story = {
  args: {
    children: "new • new • new • new • new • ",
    className: "font-medium text-primary text-xs uppercase",
    radius: 4,
  },
};
