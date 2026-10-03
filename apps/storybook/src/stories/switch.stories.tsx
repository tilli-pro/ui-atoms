import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@tilli.dev/ui-atoms/switch";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Switch id="airplane" />
      <label htmlFor="airplane">Airplane Mode</label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Switch defaultChecked={true} id="checked" />
      <label htmlFor="checked">Enabled</label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch disabled={true} id="disabled-off" />
        <label htmlFor="disabled-off" style={{ color: "#888" }}>
          Disabled (off)
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Switch defaultChecked={true} disabled={true} id="disabled-on" />
        <label htmlFor="disabled-on" style={{ color: "#888" }}>
          Disabled (on)
        </label>
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "280px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            id="notifications-label"
            style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}
          >
            Notifications
          </p>
          <p
            style={{
              margin: "0.125rem 0 0",
              fontSize: "0.75rem",
              color: "#666",
            }}
          >
            Receive push notifications
          </p>
        </div>
        <Switch aria-labelledby="notifications-label" id="notifications" />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            id="dark-mode-label"
            style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}
          >
            Dark mode
          </p>
          <p
            style={{
              margin: "0.125rem 0 0",
              fontSize: "0.75rem",
              color: "#666",
            }}
          >
            Use dark theme
          </p>
        </div>
        <Switch
          aria-labelledby="dark-mode-label"
          defaultChecked={true}
          id="dark-mode"
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            id="auto-save-label"
            style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}
          >
            Auto-save
          </p>
          <p
            style={{
              margin: "0.125rem 0 0",
              fontSize: "0.75rem",
              color: "#666",
            }}
          >
            Save changes automatically
          </p>
        </div>
        <Switch
          aria-labelledby="auto-save-label"
          disabled={true}
          id="auto-save"
        />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => <Switch aria-label="Airplane mode" />,
  play: async ({ canvasElement }) => {
    const s = within(canvasElement).getByRole("switch", {
      name: "Airplane mode",
    });
    await userEvent.click(s);
    await expect(s).toBeChecked();
  },
};
