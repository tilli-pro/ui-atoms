import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, FieldLabel } from "@tilli.dev/ui-atoms/field";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@tilli.dev/ui-atoms/otp-field";

const meta = {
  title: "Components/OTPField",
  component: OTPField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof OTPField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    // a11y: OTPField.Input reads its accessible name from the
    // enclosing Field's registered label (`useLabelableContext`'s `labelId`),
    // not from an `aria-labelledby` passed directly to OTPField — that prop
    // labels the group itself and is deliberately NOT threaded to the slots
    // (base-ui's own dev warning names `Field.Label` as the fix).
    <Field style={{ gap: "0.5rem" }}>
      <FieldLabel>Verification code</FieldLabel>
      <OTPField length={6}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
        </div>
        <OTPFieldSeparator />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
        </div>
      </OTPField>
    </Field>
  ),
  args: { length: 6 },
};
