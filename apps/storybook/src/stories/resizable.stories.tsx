import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@tilli.dev/ui-atoms/resizable";

const meta = {
  title: "Components/Resizable",
  component: ResizablePanelGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "500px", height: "200px" }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Panel One</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Panel Two</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { direction: "horizontal" },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: "500px", height: "300px" }}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={40}>
          <div style={{ padding: "1rem", height: "100%" }}>Top Panel</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={60}>
          <div style={{ padding: "1rem", height: "100%" }}>Bottom Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { direction: "vertical" },
};

export const ThreePanels: Story = {
  render: () => (
    <div style={{ width: "600px", height: "200px" }}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25}>
          <div style={{ padding: "1rem", height: "100%" }}>Sidebar</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={50}>
          <div style={{ padding: "1rem", height: "100%" }}>Main Content</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={25}>
          <div style={{ padding: "1rem", height: "100%" }}>Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { direction: "horizontal" },
};
