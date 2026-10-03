import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@tilli.dev/ui-atoms/tabs";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" style={{ width: "400px" }}>
      <TabsList>
        <TabsTab value="tab1">Tab 1</TabsTab>
        <TabsTab value="tab2">Tab 2</TabsTab>
        <TabsTab value="tab3">Tab 3</TabsTab>
      </TabsList>
      <TabsPanel value="tab1">
        <p style={{ padding: "1rem" }}>Content for tab 1</p>
      </TabsPanel>
      <TabsPanel value="tab2">
        <p style={{ padding: "1rem" }}>Content for tab 2</p>
      </TabsPanel>
      <TabsPanel value="tab3">
        <p style={{ padding: "1rem" }}>Content for tab 3</p>
      </TabsPanel>
    </Tabs>
  ),
};

export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="tab1" style={{ width: "400px" }}>
      <TabsList variant="underline">
        <TabsTab value="tab1">Tab 1</TabsTab>
        <TabsTab value="tab2">Tab 2</TabsTab>
        <TabsTab value="tab3">Tab 3</TabsTab>
      </TabsList>
      <TabsPanel value="tab1">
        <p style={{ padding: "1rem" }}>Content for tab 1</p>
      </TabsPanel>
      <TabsPanel value="tab2">
        <p style={{ padding: "1rem" }}>Content for tab 2</p>
      </TabsPanel>
      <TabsPanel value="tab3">
        <p style={{ padding: "1rem" }}>Content for tab 3</p>
      </TabsPanel>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="overview" style={{ width: "400px" }}>
      <TabsList>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="analytics">Analytics</TabsTab>
        <TabsTab disabled={true} value="reports">
          Reports
        </TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
      </TabsList>
      <TabsPanel value="overview">
        <p style={{ padding: "1rem" }}>Overview content</p>
      </TabsPanel>
      <TabsPanel value="analytics">
        <p style={{ padding: "1rem" }}>Analytics content</p>
      </TabsPanel>
      <TabsPanel value="reports">
        <p style={{ padding: "1rem" }}>Reports content (disabled tab)</p>
      </TabsPanel>
      <TabsPanel value="settings">
        <p style={{ padding: "1rem" }}>Settings content</p>
      </TabsPanel>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" style={{ width: "400px" }}>
      <TabsList>
        {Array.from({ length: 8 }, (_, i) => (
          <TabsTab key={i} value={`tab${i + 1}`}>
            Tab {i + 1}
          </TabsTab>
        ))}
      </TabsList>
      {Array.from({ length: 8 }, (_, i) => (
        <TabsPanel key={i} value={`tab${i + 1}`}>
          <p style={{ padding: "1rem" }}>Content for tab {i + 1}</p>
        </TabsPanel>
      ))}
    </Tabs>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Tabs defaultValue="account" style={{ width: "450px" }}>
      <TabsList>
        <TabsTab value="account">Account</TabsTab>
        <TabsTab value="billing">Billing</TabsTab>
        <TabsTab value="notifications">Notifications</TabsTab>
      </TabsList>
      <TabsPanel value="account">
        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Account Details</h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
            }}
          >
            Manage your account information and preferences.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <span>Name</span>
              <span>Jane Doe</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <span>Email</span>
              <span>jane@example.com</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.875rem",
              }}
            >
              <span>Account ID</span>
              <span>#ACC-00123</span>
            </div>
          </div>
        </div>
      </TabsPanel>
      <TabsPanel value="billing">
        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Billing</h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
            }}
          >
            Current plan: <strong>Pro</strong> — $49/month
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            Next billing date: February 1, 2026
          </p>
        </div>
      </TabsPanel>
      <TabsPanel value="notifications">
        <div
          style={{
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1rem" }}>Notifications</h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--muted-foreground)",
            }}
          >
            Configure how you receive alerts and updates.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <label
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <input defaultChecked={true} type="checkbox" />
              Email notifications
            </label>
            <label
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <input defaultChecked={false} type="checkbox" />
              SMS alerts
            </label>
          </div>
        </div>
      </TabsPanel>
    </Tabs>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a">Panel A</TabsPanel>
      <TabsPanel value="b">Panel B</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("tab", { name: "B" }));
    // The outgoing panel stays mounted with `data-ending-style` until its
    // exit transition ends, so both panels can briefly coexist — `findBy`
    // retries past that instead of `getBy`'s one-shot "multiple elements"
    // failure.
    await expect(await c.findByRole("tabpanel")).toHaveTextContent("Panel B");
  },
};
