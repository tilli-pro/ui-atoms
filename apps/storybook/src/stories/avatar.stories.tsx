import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tilli.dev/ui-atoms/avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage alt="User" src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      {(
        [
          { label: "xs", cls: "h-6 w-6 text-xs" },
          { label: "sm", cls: "h-8 w-8 text-sm" },
          { label: "md", cls: "h-10 w-10" },
          { label: "lg", cls: "h-14 w-14 text-lg" },
          { label: "xl", cls: "h-20 w-20 text-xl" },
        ] as const
      ).map(({ label, cls }) => (
        <div
          key={label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <Avatar className={cls}>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <span style={{ fontSize: "0.75rem", color: "#666" }}>{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div style={{ display: "flex" }}>
      {["AB", "CD", "EF", "GH", "IJ"].map((initials, idx) => (
        <Avatar
          className="border-2 border-background"
          key={initials}
          style={{ marginLeft: idx === 0 ? 0 : "-0.5rem" }}
        >
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
