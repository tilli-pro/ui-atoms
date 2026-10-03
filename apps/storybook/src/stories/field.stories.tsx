import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@tilli.dev/ui-atoms/field";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field style={{ width: "300px" }}>
      <FieldLabel>Email</FieldLabel>
      <FieldControl
        render={
          <input
            placeholder="name@example.com"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
            }}
            type="email"
          />
        }
      />
      <FieldDescription>We'll never share your email.</FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field invalid={true} style={{ width: "300px" }}>
      <FieldLabel>Email</FieldLabel>
      <FieldControl
        render={
          <input
            defaultValue="invalid"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid var(--destructive)",
              borderRadius: "0.375rem",
            }}
            type="email"
          />
        }
      />
      <FieldError>Please enter a valid email address.</FieldError>
    </Field>
  ),
};
