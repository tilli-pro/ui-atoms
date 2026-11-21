import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@tilli.dev/ui-atoms/context-menu";
import { expect, fireEvent, screen, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function Area() {
  return (
    <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
      Right-click here
    </ContextMenuTrigger>
  );
}

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <Area />
      <ContextMenuPopup>
        <ContextMenuItem>
          Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  ),
};

export const WithCheckboxItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A checkbox item shows a tick by default; `variant="switch"` swaps it for a switch-shaped indicator, whose thumb travels the other way under `dir="rtl"`.',
      },
    },
  },
  render: () => (
    <ContextMenu>
      <Area />
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Columns</ContextMenuGroupLabel>
          <ContextMenuCheckboxItem defaultChecked={true}>
            Status
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem>Due date</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem defaultChecked={true} variant="switch">
          Compact rows
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem variant="switch">
          Show totals
        </ContextMenuCheckboxItem>
      </ContextMenuPopup>
    </ContextMenu>
  ),
};

export const WithRadioItems: Story = {
  render: () => (
    <ContextMenu>
      <Area />
      <ContextMenuPopup>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Sort by</ContextMenuGroupLabel>
          <ContextMenuRadioGroup defaultValue="date">
            <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
            <ContextMenuRadioItem value="amount">Amount</ContextMenuRadioItem>
            <ContextMenuRadioItem value="status">Status</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>
  ),
};

export const Interactive: Story = {
  render: () => (
    <ContextMenu>
      <Area />
      <ContextMenuPopup>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Paste</ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  ),
  play: async ({ canvasElement }) => {
    await fireEvent.contextMenu(
      within(canvasElement).getByText("Right-click here"),
    );
    await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
    await expect(
      screen.getByRole("menuitem", { name: "Copy" }),
    ).toBeInTheDocument();
  },
};
