import type { Meta, StoryObj } from "@storybook/react-vite";
import { CurrencyInput } from "@tilli.dev/ui-atoms/currency-input";

const meta = {
  title: "Components/CurrencyInput",
  component: CurrencyInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: { type: "number" },
      description: "Initial amount to display",
    },
    currency: {
      control: { type: "select" },
      options: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
      description: "Currency code",
    },
    locale: {
      control: { type: "select" },
      options: ["en-US", "en-GB", "de-DE", "fr-FR", "ja-JP"],
      description: "Locale for formatting",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Whether the input is disabled",
    },
  },
} satisfies Meta<typeof CurrencyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currency: "USD",
    defaultValue: 100,
    locale: "en-US",
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <label
        htmlFor="currency-default"
        style={{ display: "block", fontSize: "0.8rem", fontWeight: 500 }}
      >
        Amount
      </label>
      <CurrencyInput {...args} id="currency-default" />
    </div>
  ),
};

export const Euro: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <label
        htmlFor="currency-euro"
        style={{ display: "block", fontSize: "0.8rem", fontWeight: 500 }}
      >
        Amount
      </label>
      <CurrencyInput
        currency="EUR"
        defaultValue={50}
        id="currency-euro"
        locale="de-DE"
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <label
        htmlFor="currency-disabled"
        style={{ display: "block", fontSize: "0.8rem", fontWeight: 500 }}
      >
        Amount
      </label>
      <CurrencyInput
        currency="USD"
        defaultValue={250}
        disabled={true}
        id="currency-disabled"
        locale="en-US"
      />
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
        width: "300px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label
          htmlFor="currency-payment-amount"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Payment amount (min $10, max $500)
        </label>
        <CurrencyInput
          currency="USD"
          defaultValue={10}
          id="currency-payment-amount"
          locale="en-US"
          max={500}
          min={10}
        />
        <p
          style={{ fontSize: "0.75rem", color: "#666", margin: "0.125rem 0 0" }}
        >
          Enter an amount between $10.00 and $500.00
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label
          htmlFor="currency-monthly-budget"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Monthly budget (GBP, up to £1000)
        </label>
        <CurrencyInput
          currency="GBP"
          defaultValue={0}
          id="currency-monthly-budget"
          locale="en-GB"
          max={1000}
          min={0}
        />
      </div>
    </div>
  ),
};
