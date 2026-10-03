import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@tilli.dev/ui-atoms/command";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Command",
  component: Command,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        width: "350px",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
      }}
    >
      <Command>
        <CommandInput placeholder="Type a command..." />
        {/* a11y: `CommandEmpty` renders `role="status"`, which
            `aria-required-children` forbids as a child of `CommandList`'s
            `role="listbox"` (option/group only) — it belongs as a sibling,
            not nested inside the list, unlike the old cmdk API this was
            ported from. */}
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandGroupLabel>Actions</CommandGroupLabel>
            <CommandItem>Search</CommandItem>
            <CommandItem>Settings</CommandItem>
            <CommandItem>Profile</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup>
            <CommandGroupLabel>Help</CommandGroupLabel>
            <CommandItem>Documentation</CommandItem>
            <CommandItem>Support</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

const COMMAND_ACTIONS = ["Search", "Settings", "Profile"];

export const Interactive: Story = {
  render: () => (
    <div
      style={{
        width: "350px",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
      }}
    >
      {/* Type-to-filter needs the `items`-driven form (CMD-2: "`items` plus
          a render-function child replace cmdk's implicit child scanning") —
          the static-children form the other stories in this file use (and
          `mode="none"` would keep) never narrows the list, it only moves the
          highlight. */}
      <Command items={COMMAND_ACTIONS}>
        <CommandInput placeholder="Type a command..." />
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandList>
          {(item: string) => <CommandItem key={item}>{item}</CommandItem>}
        </CommandList>
      </Command>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input =
      within(canvasElement).getByPlaceholderText("Type a command...");
    await userEvent.type(input, "Set");
    await waitFor(async () =>
      expect(
        await screen.findByRole("option", { name: "Settings" }),
      ).toBeVisible(),
    );
    await expect(
      screen.queryByRole("option", { name: "Search" }),
    ).not.toBeInTheDocument();
    // `Command` (unlike `CommandDialog`) is "an always-open, inline,
    // always-highlighting Autocomplete" (see its own doc comment) — it
    // renders `inline` to the underlying primitive, which disables the
    // floating-popup dismiss behaviour (Escape-to-close, outside-press)
    // entirely, so there is no "closed" state to assert here the way the
    // other popups have.
  },
};
