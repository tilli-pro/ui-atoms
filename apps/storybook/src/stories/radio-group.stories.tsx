import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "@tilli.dev/ui-atoms/radio-group";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-option1" value="option1" />
          <label htmlFor="radio-option1">Option 1</label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-option2" value="option2" />
          <label htmlFor="radio-option2">Option 2</label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-option3" value="option3" />
          <label htmlFor="radio-option3">Option 3</label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="plan1" disabled={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-plan1" value="plan1" />
          <label htmlFor="radio-plan1" style={{ color: "#888" }}>
            Free plan (selected)
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-plan2" value="plan2" />
          <label htmlFor="radio-plan2" style={{ color: "#888" }}>
            Pro plan (disabled)
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-plan3" value="plan3" />
          <label htmlFor="radio-plan3" style={{ color: "#888" }}>
            Enterprise plan (disabled)
          </label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="card">
      <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-card" value="card" />
          <label htmlFor="radio-card">Card</label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-paypal" value="paypal" />
          <label htmlFor="radio-paypal">PayPal</label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio id="radio-bank" value="bank" />
          <label htmlFor="radio-bank">Bank transfer</label>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  render: () => (
    <RadioGroup aria-label="Size">
      <Radio aria-label="S" value="s" />
      <Radio aria-label="M" value="m" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("radio", { name: "M" }));
    await expect(c.getByRole("radio", { name: "M" })).toBeChecked();
    await userEvent.keyboard("{ArrowUp}");
    await expect(c.getByRole("radio", { name: "S" })).toBeChecked();
  },
};
