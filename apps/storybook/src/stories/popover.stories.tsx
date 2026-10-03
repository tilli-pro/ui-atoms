import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Popover,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@tilli.dev/ui-atoms/popover";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open Popover
      </PopoverTrigger>
      <PopoverPopup>
        <p style={{ padding: "0.5rem" }}>Popover content goes here.</p>
      </PopoverPopup>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Edit Name
      </PopoverTrigger>
      <PopoverPopup>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            padding: "1rem",
            minWidth: "240px",
          }}
        >
          <p style={{ fontWeight: 600, margin: 0 }}>Edit display name</p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <label
              htmlFor="display-name"
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              Name
            </label>
            <input
              defaultValue="John Doe"
              id="display-name"
              style={{
                padding: "0.375rem 0.625rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
              type="text"
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open
      </PopoverTrigger>
      <PopoverPopup>
        <PopoverTitle>Pop</PopoverTitle>
      </PopoverPopup>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open" }),
    );
    // The popup mounts mid-transition, so the visibility check retries past
    // it — `storybook/test`'s `expect` does not poll.
    await waitFor(async () =>
      expect(await screen.findByText("Pop")).toBeVisible(),
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByText("Pop")).not.toBeInTheDocument(),
    );
  },
};
