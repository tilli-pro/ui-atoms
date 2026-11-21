import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from "@tilli.dev/ui-atoms/sheet";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Sheet
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p>
            Body content goes in `SheetPanel`: it is padded to line up with the
            header and scrolls when it is taller than the sheet.
          </p>
        </SheetPanel>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button />}>Notification Settings</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Notification Settings</SheetTitle>
          <SheetDescription>
            Choose how and when you receive notifications.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {[
            {
              id: "sheet-billing",
              label: "Billing Alerts",
              description: "Get notified when a payment is due or processed",
              defaultChecked: true,
            },
            {
              id: "sheet-usage",
              label: "Usage Alerts",
              description: "Receive alerts when usage exceeds your threshold",
              defaultChecked: true,
            },
            {
              id: "sheet-outage",
              label: "Outage Notifications",
              description: "Be informed of planned and unplanned outages",
              defaultChecked: false,
            },
            {
              id: "sheet-promo",
              label: "Promotions",
              description: "Hear about special offers and rate changes",
              defaultChecked: false,
            },
          ].map(({ id, label, description, defaultChecked }) => (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <input
                defaultChecked={defaultChecked}
                id={id}
                style={{ marginTop: "0.2rem" }}
                type="checkbox"
              />
              <div>
                <label
                  htmlFor={id}
                  style={{
                    display: "block",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </label>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted-foreground)",
                    margin: "0.125rem 0 0",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          ))}
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost" />}>Cancel</SheetClose>
          <Button>Save Preferences</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger render={<Button variant="outline" />}>
            {side}
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>{side} Sheet</SheetTitle>
              <SheetDescription>Opens from the {side}.</SheetDescription>
            </SheetHeader>
            <SheetPanel>
              <p>Sheet content.</p>
            </SheetPanel>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};

export const Inset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`variant="inset"` floats the sheet as a rounded card with a margin from `sm:` up; below that it is edge to edge like the default.',
      },
    },
  },
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Inset Sheet
      </SheetTrigger>
      <SheetContent side="right" variant="inset">
        <SheetHeader>
          <SheetTitle>Invoice 1042</SheetTitle>
          <SheetDescription>Issued 3 November 2026.</SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <p>Amount due: $240.00</p>
        </SheetPanel>
        <SheetFooter variant="bare">
          <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const ScrollingBody: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Long Sheet
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Activity</SheetTitle>
          <SheetDescription>
            The last 40 events on this account.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <ul
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {Array.from({ length: 40 }, (_, i) => `Event ${i + 1}`).map(
              (label) => (
                <li key={label}>{label}</li>
              ),
            )}
          </ul>
        </SheetPanel>
        <SheetFooter>
          <SheetClose render={<Button />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open" }),
    );
    const sheet = await screen.findByRole("dialog");
    // The popup mounts mid-transition, so the visibility check retries past
    // it — `storybook/test`'s `expect` does not poll.
    await waitFor(() => expect(sheet).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
