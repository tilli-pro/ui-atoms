import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@tilli.dev/ui-atoms/frame";

const meta = {
  title: "Components/Frame",
  component: Frame,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Frame style={{ width: "400px" }}>
      <FrameHeader>
        <FrameTitle>Frame Title</FrameTitle>
        <FrameDescription>Frame description text.</FrameDescription>
      </FrameHeader>
      <FramePanel>
        <p>Frame content area.</p>
      </FramePanel>
      <FrameFooter>
        <p>Frame footer</p>
      </FrameFooter>
    </Frame>
  ),
};
