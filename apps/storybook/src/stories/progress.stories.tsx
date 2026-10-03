import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
} from "@tilli.dev/ui-atoms/progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "300px" }}>
      <Progress {...args}>
        <ProgressLabel>Upload progress</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
  args: { value: 60 },
};

export const Values: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "300px",
      }}
    >
      {[0, 25, 50, 75, 100].map((value) => (
        <Progress key={value} value={value}>
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      ))}
    </div>
  ),
  args: { value: 50 },
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Progress value={null}>
        <ProgressLabel>Loading</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
  args: { value: null },
};
