import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@tilli.dev/ui-atoms/textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
      description: "Size of the textarea",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the textarea is disabled",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Type your message...",
    size: "default",
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <Textarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Cannot type here",
    disabled: true,
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <Textarea {...args} />
    </div>
  ),
};

export const MaxLength: Story = {
  render: () => (
    <div
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label
          htmlFor="textarea-bio"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Bio
        </label>
        <span style={{ fontSize: "0.75rem", color: "#666" }}>0 / 160</span>
      </div>
      <Textarea
        id="textarea-bio"
        maxLength={160}
        placeholder="Write a short bio about yourself (max 160 characters)..."
      />
      <p style={{ fontSize: "0.75rem", color: "#666", margin: 0 }}>
        Keep it short and sweet.
      </p>
    </div>
  ),
};

export const AutoResize: Story = {
  render: () => (
    <div
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <label
        htmlFor="textarea-notes"
        style={{ fontSize: "0.8rem", fontWeight: 500 }}
      >
        Notes (grows with content)
      </label>
      <Textarea
        defaultValue="Line 1\nLine 2\nLine 3\nLine 4\nLine 5"
        id="textarea-notes"
        placeholder="Add notes here..."
        rows={3}
        style={{ resize: "none", overflow: "hidden" }}
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "300px",
      }}
    >
      {(["sm", "default", "lg"] as const).map((size) => (
        <Textarea key={size} placeholder={`Size: ${size}`} size={size} />
      ))}
    </div>
  ),
};
