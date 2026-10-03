import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@tilli.dev/ui-atoms/resizable";

const meta = {
  title: "Components/Resizable Framing",
  component: ResizablePanelGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: "500px", height: "200px" }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Left</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Right</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { direction: "horizontal" },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: "300px", height: "300px" }}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Top</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Bottom</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { direction: "vertical" },
};
