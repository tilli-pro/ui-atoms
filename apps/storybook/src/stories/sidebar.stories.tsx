import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@tilli.dev/ui-atoms/sidebar";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <div style={{ display: "flex", minHeight: "400px" }}>
        <Sidebar>
          <SidebarHeader>
            <h3 style={{ padding: "0.5rem" }}>App Name</h3>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Users</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p style={{ padding: "0.5rem", fontSize: "0.75rem" }}>v1.0.0</p>
          </SidebarFooter>
        </Sidebar>
        <main style={{ flex: 1, padding: "1rem" }}>Main content area</main>
      </div>
    </SidebarProvider>
  ),
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "#" },
  { label: "Billing", href: "#" },
  { label: "Usage", href: "#" },
  { label: "Alerts", href: "#" },
  { label: "Settings", href: "#" },
];

export const WithActiveItem: Story = {
  render: () => (
    <SidebarProvider>
      <div style={{ display: "flex", minHeight: "400px" }}>
        <Sidebar>
          <SidebarHeader>
            <h3 style={{ padding: "0.5rem" }}>tilliX</h3>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map(({ label }) => (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton isActive={label === "Billing"}>
                        {label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p style={{ padding: "0.5rem", fontSize: "0.75rem" }}>v1.0.0</p>
          </SidebarFooter>
        </Sidebar>
        <main style={{ flex: 1, padding: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Billing</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
            Manage your billing and payment methods.
          </p>
        </main>
      </div>
    </SidebarProvider>
  ),
};
