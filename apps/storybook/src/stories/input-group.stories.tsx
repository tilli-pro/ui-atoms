import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@tilli.dev/ui-atoms/input-group";

const meta = {
  title: "Components/InputGroup",
  component: InputGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon align="inline-start">$</InputGroupAddon>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">USD</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const Email: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon align="inline-start">@</InputGroupAddon>
        <InputGroupInput placeholder="username" type="text" />
      </InputGroup>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        width: "320px",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0" }}>
        Input with submit button
      </p>
      <InputGroup>
        <InputGroupInput placeholder="Enter promo code" />
        <InputGroupAddon align="inline-end">
          <Button size="sm" variant="default">
            Apply
          </Button>
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
        Search input with button
      </p>
      <InputGroup>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Button size="sm" variant="ghost">
            Search
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
