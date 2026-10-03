import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@tilli.dev/ui-atoms/drawer";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Drawer
      </DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer description text.</DrawerDescription>
        </DrawerHeader>
        <div style={{ padding: "1rem" }}>Drawer content here.</div>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button />}>Add Payment Method</DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Add Payment Method</DrawerTitle>
          <DrawerDescription>
            Enter your card details to save a new payment method.
          </DrawerDescription>
        </DrawerHeader>
        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <div>
            <label
              htmlFor="drawer-card-number"
              style={{
                display: "block",
                fontSize: "0.875rem",
                marginBottom: "0.25rem",
              }}
            >
              Card Number
            </label>
            <input
              id="drawer-card-number"
              placeholder="4242 4242 4242 4242"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="drawer-expiry"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                Expiry
              </label>
              <input
                id="drawer-expiry"
                placeholder="MM / YY"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="drawer-cvc"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                CVC
              </label>
              <input
                id="drawer-cvc"
                placeholder="123"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button style={{ width: "100%" }}>Save Card</Button>
          <DrawerClose
            render={<Button style={{ width: "100%" }} variant="outline" />}
          >
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
};

export const WithNavigation: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Open Menu
      </DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Jump to a section</DrawerDescription>
        </DrawerHeader>
        <nav style={{ padding: "0.5rem 1rem" }}>
          {[
            { label: "Dashboard", icon: "🏠" },
            { label: "Billing", icon: "💳" },
            { label: "Usage", icon: "📊" },
            { label: "Alerts", icon: "🔔" },
            { label: "Settings", icon: "⚙️" },
            { label: "Help & Support", icon: "❓" },
          ].map(({ label, icon }) => (
            <button
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                width: "100%",
                padding: "0.75rem 0.5rem",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                fontSize: "0.875rem",
                textAlign: "left",
              }}
              type="button"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Open</DrawerTrigger>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer description text.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Open" }),
    );
    const drawer = await screen.findByRole("dialog");
    // The popup mounts mid-transition, so the visibility check retries past
    // it — `storybook/test`'s `expect` does not poll.
    await waitFor(() => expect(drawer).toBeVisible());
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
