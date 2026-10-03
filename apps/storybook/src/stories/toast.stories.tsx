import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  type ToastPosition,
  ToastProvider,
  toastManager,
} from "@tilli.dev/ui-atoms/toast";
import { expect, screen, userEvent, within } from "storybook/test";

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const meta = {
  title: "Components/Toast",
  component: ToastProvider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Button
        onClick={() =>
          toastManager.add({
            title: "Toast!",
            description: "This is a toast notification.",
          })
        }
      >
        Show Toast
      </Button>
    </ToastProvider>
  ),
};

export const Variants: Story = {
  render: () => (
    <ToastProvider>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Info",
              description: "Informational message.",
              type: "info",
            })
          }
          variant="secondary"
        >
          Info
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Success",
              description: "Action completed successfully.",
              type: "success",
            })
          }
          variant="secondary"
        >
          Success
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Warning",
              description: "Proceed with caution.",
              type: "warning",
            })
          }
          variant="secondary"
        >
          Warning
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Error",
              description: "Something went wrong.",
              type: "error",
            })
          }
          variant="destructive"
        >
          Error
        </Button>
        <Button
          onClick={() =>
            toastManager.add({
              title: "Loading",
              description: "Processing your request…",
              type: "loading",
            })
          }
          variant="outline"
        >
          Loading
        </Button>
      </div>
    </ToastProvider>
  ),
};

export const Positions: Story = {
  render: () => (
    <ToastProvider>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {POSITIONS.map((position) => (
          <Button
            key={position}
            onClick={() =>
              toastManager.add({
                title: position,
                description: `Toast shown at ${position}.`,
              })
            }
            size="sm"
            variant="outline"
          >
            {position}
          </Button>
        ))}
      </div>
    </ToastProvider>
  ),
};

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <Button
        onClick={() =>
          toastManager.add({
            title: "Toast!",
            description: "This is a toast notification.",
          })
        }
      >
        Show
      </Button>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Show" }),
    );
    // This base-ui version renders a toast's root with `role="dialog"`
    // (`"alertdialog"` only at high priority), not `"status"` — the ARIA
    // `alert`/`log` live region instead lives on the hidden announcer inside
    // `Toast.Viewport`, not on the visible root this story renders.
    const toast = await screen.findByRole("dialog");
    await expect(toast).toHaveTextContent("Toast!");
  },
};
