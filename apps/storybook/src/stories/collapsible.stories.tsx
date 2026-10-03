import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@tilli.dev/ui-atoms/collapsible";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible style={{ width: "300px" }}>
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div style={{ padding: "0.5rem" }}>Collapsible content here.</div>
      </CollapsiblePanel>
    </Collapsible>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen={true} style={{ width: "300px" }}>
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle (starts open)
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div style={{ padding: "0.5rem" }}>
          This panel is open by default. Click the button to collapse it.
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Collapsible disabled={true} style={{ width: "300px" }}>
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle (disabled)
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div style={{ padding: "0.5rem" }}>
          This content is not accessible while disabled.
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Collapsible style={{ width: "300px" }}>
      <CollapsibleTrigger render={<Button variant="outline" />}>
        Toggle
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div style={{ padding: "0.5rem" }}>Collapsible content here.</div>
      </CollapsiblePanel>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Toggle" }));
    // The panel mounts mid-transition, so the visibility check retries past
    // it — `storybook/test`'s `expect` does not poll.
    await waitFor(() =>
      expect(c.getByText("Collapsible content here.")).toBeVisible(),
    );
    await userEvent.click(c.getByRole("button", { name: "Toggle" }));
    // Base UI keeps the panel mounted with `data-ending-style` until its
    // exit transition ends, so the "closed" check goes through `waitFor`
    // too (same reasoning as the other popups' "gone" assertions).
    await waitFor(() =>
      expect(
        c.queryByText("Collapsible content here."),
      ).not.toBeInTheDocument(),
    );
  },
};
