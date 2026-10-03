import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox id="terms" />
      <label htmlFor="terms">Accept terms and conditions</label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox disabled={true} id="disabled-unchecked" />
        <label htmlFor="disabled-unchecked" style={{ color: "#888" }}>
          Disabled (unchecked)
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox defaultChecked={true} disabled={true} id="disabled-checked" />
        <label htmlFor="disabled-checked" style={{ color: "#888" }}>
          Disabled (checked)
        </label>
      </div>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        maxWidth: "320px",
      }}
    >
      <Checkbox id="marketing" style={{ marginTop: "2px" }} />
      <div>
        <label
          htmlFor="marketing"
          style={{ fontSize: "0.875rem", fontWeight: 500, display: "block" }}
        >
          Marketing emails
        </label>
        <p
          style={{ fontSize: "0.75rem", color: "#666", margin: "0.25rem 0 0" }}
        >
          Receive emails about new products, features, and more.
        </p>
      </div>
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={{ fontSize: "0.75rem", color: "#666", margin: "0 0 0.25rem" }}>
        Indeterminate state (mixed selection)
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="indeterminate" indeterminate={true} />
        <label htmlFor="indeterminate">Select all (3 of 5 selected)</label>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => <Checkbox aria-label="Accept" />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox", {
      name: "Accept",
    });
    await userEvent.click(box);
    await expect(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(box).not.toBeChecked();
  },
};
