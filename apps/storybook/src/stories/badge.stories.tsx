import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import { VariantMatrix } from "../helpers/variant-matrix";

const VARIANTS = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
] as const;
const SIZES = ["sm", "default", "lg"] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Badge", variant: "default", size: "default" },
};

export const AllVariants: Story = {
  render: () => (
    <VariantMatrix
      component={Badge}
      props={{ children: "Badge" }}
      sizeProp="size"
      sizes={SIZES}
      variantProp="variant"
      variants={VARIANTS}
    />
  ),
};

export const Info: Story = { args: { variant: "info", children: "Info" } };
export const Success: Story = {
  args: { variant: "success", children: "Success" },
};
export const Warning: Story = {
  args: { variant: "warning", children: "Warning" },
};
export const ErrorBadge: Story = {
  args: { variant: "error", children: "Error" },
};

export const LongText: Story = {
  args: {
    children:
      "This is a very long badge label that tests text overflow behavior",
    variant: "default",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      {SIZES.map((size) => (
        <Badge key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};
