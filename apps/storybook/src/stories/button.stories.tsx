import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import { fn } from "storybook/test";
import { VariantMatrix } from "../helpers/variant-matrix";

const VARIANTS = [
  "default",
  "outline",
  "secondary",
  "destructive",
  "destructive-outline",
  "ghost",
  "link",
] as const;
const SIZES = ["xs", "sm", "default", "lg", "xl"] as const;
const ICON_SIZES = [
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
  "icon-xl",
] as const;

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "destructive",
        "destructive-outline",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <VariantMatrix
      component={Button}
      props={{ children: "Button", onClick: fn() }}
      sizeProp="size"
      sizes={SIZES}
      variantProp="variant"
      variants={VARIANTS}
    />
  ),
};

export const IconSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      {ICON_SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Button size={size}>✕</Button>
          <span style={{ fontSize: "0.75rem", color: "#666" }}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Destructive" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const Link: Story = {
  args: { variant: "link", children: "Link" },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const DisabledVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {VARIANTS.map((variant) => (
        <Button disabled={true} key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const WithLeftIcon: Story = {
  args: { children: "★ With Icon", variant: "default" },
};

export const WithRightIcon: Story = {
  args: { children: "With Icon →", variant: "default" },
};

export const Loading: Story = {
  args: { children: "Loading…", loading: true, variant: "default" },
};
