import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@tilli.dev/ui-atoms/number-field";

const meta = {
  title: "Components/NumberField",
  component: NumberField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <label
        htmlFor="number-field-default"
        style={{ display: "block", fontSize: "0.8rem", fontWeight: 500 }}
      >
        Quantity
      </label>
      <NumberField defaultValue={5} id="number-field-default">
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div>
      <label
        htmlFor="number-field-disabled"
        style={{ display: "block", fontSize: "0.8rem", fontWeight: 500 }}
      >
        Quantity
      </label>
      <NumberField defaultValue={3} disabled={true} id="number-field-disabled">
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "280px",
      }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="number-field-quantity"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Quantity (1–10)
        </label>
        <NumberField
          defaultValue={1}
          id="number-field-quantity"
          max={10}
          min={1}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="number-field-rating"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Rating (0–5, step 0.5)
        </label>
        <NumberField
          defaultValue={3}
          id="number-field-rating"
          max={5}
          min={0}
          step={0.5}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </div>
    </div>
  ),
};
