import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "@tilli.dev/ui-atoms/segmented-control";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const PERIODS = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

function Demo({
  disabled = false,
  options = PERIODS,
}: {
  disabled?: boolean;
  options?: { label: string; value: string }[];
}) {
  const [value, setValue] = useState(options[0]?.value ?? "");
  return (
    <div className="flex w-72 flex-col gap-2">
      <span className="font-medium text-sm" id="period-label">
        Period
      </span>
      <SegmentedControl
        ariaLabelledBy="period-label"
        disabled={disabled}
        onChange={setValue}
        options={options}
        value={value}
      />
    </div>
  );
}

const noop = () => undefined;
const baseArgs = { onChange: noop, options: PERIODS, value: "day" };

export const Default: Story = {
  args: baseArgs,
  render: () => <Demo />,
};

export const TwoOptions: Story = {
  args: baseArgs,
  render: () => (
    <Demo
      options={[
        { label: "Monthly", value: "monthly" },
        { label: "Yearly", value: "yearly" },
      ]}
    />
  ),
};

export const Disabled: Story = {
  args: baseArgs,
  render: () => <Demo disabled={true} />,
};

export const Interactive: Story = {
  args: baseArgs,
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const week = canvas.getByRole("radio", { name: "Week" });
    await userEvent.click(week);
    await expect(week).toBeChecked();
    await expect(canvas.getByRole("radio", { name: "Day" })).not.toBeChecked();
  },
};
