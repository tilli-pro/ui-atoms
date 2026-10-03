import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@tilli.dev/ui-atoms/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@tilli.dev/ui-atoms/input-group";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    unstyled: {
      control: { type: "boolean" },
      description: "Drop the wrapper's chrome",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "Size of the input",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the input is disabled",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
    unstyled: false,
    size: "default",
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Cannot type here",
    disabled: true,
  },
};

export const WithIcons: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        width: "300px",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0" }}>
        Icon on the left
      </p>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <span>👤</span>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search users..." />
      </InputGroup>
      <p
        style={{
          fontSize: "0.75rem",
          color: "#666",
          marginBottom: "0",
          marginTop: "0.5rem",
        }}
      >
        Icon on the right
      </p>
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <span>🔍</span>
        </InputGroupAddon>
      </InputGroup>
      <p
        style={{
          fontSize: "0.75rem",
          color: "#666",
          marginBottom: "0",
          marginTop: "0.5rem",
        }}
      >
        Both icons
      </p>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <span>👤</span>
        </InputGroupAddon>
        <InputGroupInput placeholder="Username" />
        <InputGroupAddon align="inline-end">
          <span>🔍</span>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        width: "300px",
      }}
    >
      <label
        htmlFor="email-input"
        style={{ fontSize: "0.875rem", fontWeight: 500 }}
      >
        Email address
      </label>
      <Input id="email-input" placeholder="name@example.com" type="email" />
      <p style={{ fontSize: "0.75rem", color: "#666" }}>
        We'll never share your email.
      </p>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: "300px",
      }}
    >
      {([false, true] as const).map((unstyled) => (
        <div key={String(unstyled)}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            {unstyled ? "unstyled" : "default"}
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {(["sm", "default", "lg"] as const).map((size) => (
              <Input
                key={size}
                placeholder={`${unstyled ? "unstyled" : "default"} / ${size}`}
                size={size}
                unstyled={unstyled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
