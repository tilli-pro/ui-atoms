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
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div style={{ padding: "1rem", height: "100%" }}>Panel One</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize="50%">
          <div style={{ padding: "1rem", height: "100%" }}>Panel Two</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { orientation: "horizontal" },
};

export const Vertical: Story = {
  render: () => (
    <div style={{ width: "500px", height: "300px" }}>
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize="40%">
          <div style={{ padding: "1rem", height: "100%" }}>Top Panel</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize="60%">
          <div style={{ padding: "1rem", height: "100%" }}>Bottom Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { orientation: "vertical" },
};

export const ThreePanels: Story = {
  render: () => (
    <div style={{ width: "600px", height: "200px" }}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="25%">
          <div style={{ padding: "1rem", height: "100%" }}>Sidebar</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize="50%">
          <div style={{ padding: "1rem", height: "100%" }}>Main Content</div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize="25%">
          <div style={{ padding: "1rem", height: "100%" }}>Panel</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
  args: { orientation: "horizontal" },
};

export const WithoutGrip: Story = {
  args: { orientation: "horizontal" },
  render: () => (
    <div style={{ width: "500px", height: "200px", border: "1px solid #ccc" }}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div style={{ padding: "1rem" }}>Panel A</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="50%">
          <div style={{ padding: "1rem" }}>Panel B</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};

export const DisabledHandle: Story = {
  args: { orientation: "horizontal" },
  render: () => (
    <div style={{ width: "500px", height: "200px", border: "1px solid #ccc" }}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="30%">
          <div style={{ padding: "1rem" }}>Fixed</div>
        </ResizablePanel>
        <ResizableHandle disabled={true} withHandle={true} />
        <ResizablePanel defaultSize="70%">
          <div style={{ padding: "1rem" }}>Content</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
};
