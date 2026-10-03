import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@tilli.dev/ui-atoms/dialog";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>This is a dialog description.</DialogDescription>
          </DialogHeader>
          <p style={{ padding: "1rem 0" }}>Dialog content goes here.</p>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit Profile</DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              padding: "1rem 0",
            }}
          >
            <div>
              <label
                htmlFor="dialog-name"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                Full Name
              </label>
              <input
                defaultValue="Jane Doe"
                id="dialog-name"
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
            <div>
              <label
                htmlFor="dialog-email"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                Email
              </label>
              <input
                defaultValue="jane@example.com"
                id="dialog-email"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
                type="email"
              />
            </div>
            <div>
              <label
                htmlFor="dialog-phone"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  marginBottom: "0.25rem",
                }}
              >
                Phone
              </label>
              <input
                defaultValue="+1 (555) 000-1234"
                id="dialog-phone"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
                type="tel"
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <DialogClose render={<Button />}>Save Changes</DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  ),
};

export const ScrollableContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        View Full Report
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Annual Usage Report</DialogTitle>
            <DialogDescription>
              Detailed breakdown of your energy consumption for 2025.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              padding: "1rem 0",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              fontSize: "0.875rem",
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ];
              const kwh = Math.floor(400 + Math.random() * 300);
              return (
                <div
                  key={months[i]}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span>{months[i]}</span>
                  <span>{kwh} kWh</span>
                  <span>${(kwh * 0.12).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <DialogClose
            render={<Button variant="outline" />}
            style={{ marginTop: "1rem" }}
          >
            Close
          </DialogClose>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Desc</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    // Base UI's mount transition animates the popup's opacity in from 0
    // over ~200ms (`data-starting-style` clears on the next frame, then the
    // CSS transition interpolates); `storybook/test`'s `expect` does not
    // poll, so the visibility check has to retry through the transition —
    // the same reason the "gone" check below does.
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
