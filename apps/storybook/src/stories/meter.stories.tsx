import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@tilli.dev/ui-atoms/meter";

const meta = {
  title: "Components/Meter",
  component: Meter,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
    },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "300px" }}>
      <Meter {...args}>
        <MeterLabel>Storage</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
  args: { value: 60 },
};

export const LowUsage: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Meter value={15}>
        <MeterLabel>Memory</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
  args: { value: 15 },
};

export const HighUsage: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Meter value={92}>
        <MeterLabel>Disk Space</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
    </div>
  ),
  args: { value: 92 },
};
