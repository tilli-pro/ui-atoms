import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@tilli.dev/ui-atoms/menu";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Menu",
  component: Menu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Open Menu</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Actions</MenuGroupLabel>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem variant="destructive">Delete</MenuItem>
      </MenuPopup>
    </Menu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>
        View Options
      </MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Columns</MenuGroupLabel>
          <MenuCheckboxItem checked={true}>Invoice ID</MenuCheckboxItem>
          <MenuCheckboxItem checked={true}>Status</MenuCheckboxItem>
          <MenuCheckboxItem checked={false}>Payment Method</MenuCheckboxItem>
          <MenuCheckboxItem checked={true}>Amount</MenuCheckboxItem>
          <MenuCheckboxItem checked={false}>Due Date</MenuCheckboxItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
};

export const WithSwitchItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`variant="switch"` on a checkbox item swaps the tick for a switch-shaped indicator.',
      },
    },
  },
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Display</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Table</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked={true} variant="switch">
            Compact rows
          </MenuCheckboxItem>
          <MenuCheckboxItem variant="switch">Show totals</MenuCheckboxItem>
          <MenuCheckboxItem disabled={true} variant="switch">
            Group by status
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
};

export const WithRadioItems: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Sort By</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>Sort Order</MenuGroupLabel>
          <MenuRadioGroup value="date-desc">
            <MenuRadioItem value="date-desc">Date (newest first)</MenuRadioItem>
            <MenuRadioItem value="date-asc">Date (oldest first)</MenuRadioItem>
            <MenuRadioItem value="amount-desc">
              Amount (highest first)
            </MenuRadioItem>
            <MenuRadioItem value="amount-asc">
              Amount (lowest first)
            </MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
};

export const Nested: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Account</MenuTrigger>
      <MenuPopup>
        <MenuGroup>
          <MenuGroupLabel>My Account</MenuGroupLabel>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Billing</MenuItem>
        </MenuGroup>
        <MenuSub>
          <MenuSubTrigger>Notifications</MenuSubTrigger>
          <MenuSubPopup>
            <MenuGroup>
              <MenuGroupLabel>Notify me via</MenuGroupLabel>
              <MenuCheckboxItem checked={true}>Email</MenuCheckboxItem>
              <MenuCheckboxItem checked={false}>SMS</MenuCheckboxItem>
              <MenuCheckboxItem checked={true}>Push</MenuCheckboxItem>
            </MenuGroup>
          </MenuSubPopup>
        </MenuSub>
        <MenuSeparator />
        <MenuItem variant="destructive">Sign Out</MenuItem>
      </MenuPopup>
    </Menu>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Actions</MenuTrigger>
      <MenuPopup>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Delete</MenuItem>
      </MenuPopup>
    </Menu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Actions" }),
    );
    // The popup mounts mid-transition, so the visibility check retries past
    // it — `storybook/test`'s `expect` does not poll.
    await waitFor(async () =>
      expect(
        await screen.findByRole("menuitem", { name: "Delete" }),
      ).toBeVisible(),
    );
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(
      screen.getByRole("menuitem", { name: "Delete" }),
    ).toHaveFocus();
  },
};
