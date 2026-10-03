import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@tilli.dev/ui-atoms/tooltip";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Hover me
        </TooltipTrigger>
        <TooltipPopup>Tooltip content</TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Interactive: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Hover
        </TooltipTrigger>
        <TooltipPopup>Tip</TooltipPopup>
      </Tooltip>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(
      within(canvasElement).getByRole("button", { name: "Hover" }),
    );
    // `findByText` alone can resolve on the popup's first (pre-transition)
    // paint, so the visibility check retries through the mount transition —
    // `storybook/test`'s `expect` does not poll.
    await waitFor(async () =>
      expect(await screen.findByText("Tip")).toBeVisible(),
    );
  },
};
