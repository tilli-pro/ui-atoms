import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
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
        <p style={{ padding: "1rem 0" }}>Sheet content.</p>
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
        <div
          style={{
            padding: "1.5rem 0",
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
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button style={{ flex: 1 }}>Save Preferences</Button>
        </div>
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
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
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
