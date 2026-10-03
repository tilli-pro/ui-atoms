import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@tilli.dev/ui-atoms/timeline";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Timeline defaultValue={2} style={{ width: "400px" }}>
      <TimelineItem step={1}>
        <TimelineHeader>
          <TimelineIndicator />
          <TimelineTitle>Created</TimelineTitle>
          <TimelineDate>Jan 1, 2026</TimelineDate>
        </TimelineHeader>
        <TimelineContent>Account was created.</TimelineContent>
        <TimelineSeparator />
      </TimelineItem>
      <TimelineItem step={2}>
        <TimelineHeader>
          <TimelineIndicator />
          <TimelineTitle>Verified</TimelineTitle>
          <TimelineDate>Jan 5, 2026</TimelineDate>
        </TimelineHeader>
        <TimelineContent>Email verified.</TimelineContent>
        <TimelineSeparator />
      </TimelineItem>
      <TimelineItem step={3}>
        <TimelineHeader>
          <TimelineIndicator />
          <TimelineTitle>Active</TimelineTitle>
          <TimelineDate>Jan 10, 2026</TimelineDate>
        </TimelineHeader>
        <TimelineContent>Account activated.</TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};
