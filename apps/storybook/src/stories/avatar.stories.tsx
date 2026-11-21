import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
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
      <AvatarImage
        alt="User"
        src="https://avatars.githubusercontent.com/u/2670350"
      />
      <AvatarFallback>JD</AvatarFallback>
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

const SIZES = [
  { label: "xs", cls: "[--avatar-size:--spacing(6)]" },
  { label: "sm", cls: "[--avatar-size:--spacing(8)]" },
  { label: "md", cls: "[--avatar-size:--spacing(10)]" },
  { label: "lg", cls: "[--avatar-size:--spacing(14)]" },
  { label: "xl", cls: "[--avatar-size:--spacing(20)]" },
] as const;

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "An avatar's size is the `--avatar-size` custom property (default `--spacing(8)`). The fallback text scales with it, so no separate text class is needed.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      {SIZES.map(({ label, cls }) => (
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
          <span className="text-muted-foreground text-xs">{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      {["AB", "CD", "EF", "GH"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const GroupLastOnTop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`topmost="last"` stacks the row the other way: each avatar is cut out around the one after it.',
      },
    },
  },
  render: () => (
    <AvatarGroup topmost="last">
      {["AB", "CD", "EF", "GH"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),
};

export const GroupSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Set `--avatar-size` on the group and the overlap, gap and cut-out scale with it. `--avatar-overlap` and `--avatar-gap` tune them directly.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {SIZES.slice(0, 4).map(({ label, cls }) => (
        <AvatarGroup className={cls} key={label}>
          {["AB", "CD", "EF"].map((initials) => (
            <Avatar key={initials}>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      ))}
    </div>
  ),
};
