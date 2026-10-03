import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fieldset, FieldsetLegend } from "@tilli.dev/ui-atoms/fieldset";
import { Input } from "@tilli.dev/ui-atoms/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";

const meta = {
  title: "Components/Fieldset",
  component: Fieldset,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Fieldset style={{ width: "300px" }}>
      <FieldsetLegend>Personal Information</FieldsetLegend>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          placeholder="First name"
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
          }}
        />
        <input
          placeholder="Last name"
          style={{
            padding: "0.5rem",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
          }}
        />
      </div>
    </Fieldset>
  ),
};

export const WithMultipleFields: Story = {
  render: () => (
    <Fieldset style={{ width: "360px" }}>
      <FieldsetLegend>Contact Details</FieldsetLegend>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <label
              htmlFor="fieldset-first-name"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              First name
            </label>
            <Input id="fieldset-first-name" placeholder="Jane" />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <label
              htmlFor="fieldset-last-name"
              style={{ fontSize: "0.8rem", fontWeight: 500 }}
            >
              Last name
            </label>
            <Input id="fieldset-last-name" placeholder="Doe" />
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label
            htmlFor="fieldset-email"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Email
          </label>
          <Input
            id="fieldset-email"
            placeholder="jane@example.com"
            type="email"
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label
            htmlFor="fieldset-phone"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Phone
          </label>
          <Input
            id="fieldset-phone"
            placeholder="+1 (555) 000-0000"
            type="tel"
          />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
        >
          <label
            htmlFor="fieldset-country"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Country
          </label>
          <Select>
            <SelectTrigger id="fieldset-country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="gb">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
            </SelectPopup>
          </Select>
        </div>
      </div>
    </Fieldset>
  ),
};
