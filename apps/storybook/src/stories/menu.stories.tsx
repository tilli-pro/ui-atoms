import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Menu,
  MenuCheckboxItem,
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
        <MenuGroupLabel>Actions</MenuGroupLabel>
        <MenuSeparator />
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
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
        <MenuGroupLabel>Columns</MenuGroupLabel>
        <MenuSeparator />
        <MenuCheckboxItem checked={true}>Invoice ID</MenuCheckboxItem>
        <MenuCheckboxItem checked={true}>Status</MenuCheckboxItem>
        <MenuCheckboxItem checked={false}>Payment Method</MenuCheckboxItem>
        <MenuCheckboxItem checked={true}>Amount</MenuCheckboxItem>
        <MenuCheckboxItem checked={false}>Due Date</MenuCheckboxItem>
      </MenuPopup>
    </Menu>
  ),
};

export const WithRadioItems: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Sort By</MenuTrigger>
      <MenuPopup>
        <MenuGroupLabel>Sort Order</MenuGroupLabel>
        <MenuSeparator />
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
      </MenuPopup>
    </Menu>
  ),
};

export const Nested: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Account</MenuTrigger>
      <MenuPopup>
        <MenuGroupLabel>My Account</MenuGroupLabel>
        <MenuSeparator />
        <MenuItem>Profile</MenuItem>
        <MenuItem>Billing</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Notifications</MenuSubTrigger>
          <MenuSubPopup>
            <MenuGroupLabel>Notify me via</MenuGroupLabel>
            <MenuSeparator />
            <MenuCheckboxItem checked={true}>Email</MenuCheckboxItem>
            <MenuCheckboxItem checked={false}>SMS</MenuCheckboxItem>
            <MenuCheckboxItem checked={true}>Push</MenuCheckboxItem>
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
