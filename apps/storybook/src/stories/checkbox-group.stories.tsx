import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import { CheckboxGroup } from "@tilli.dev/ui-atoms/checkbox-group";
import { Label } from "@tilli.dev/ui-atoms/label";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const CHANNELS = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Push", value: "push" },
];

function Options({ disabled = false }: { disabled?: boolean }) {
  return CHANNELS.map(({ label, value }) => (
    <Label key={value}>
      <Checkbox disabled={disabled} value={value} />
      {label}
    </Label>
  ));
}

export const Default: Story = {
  render: () => (
    <CheckboxGroup aria-label="Notification channels" defaultValue={["email"]}>
      <Options />
    </CheckboxGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <CheckboxGroup
      aria-label="Notification channels"
      defaultValue={["email"]}
      disabled={true}
    >
      <Options disabled={true} />
    </CheckboxGroup>
  ),
};

export const WithParent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `allValues` to the group and mark one checkbox `parent`: it checks or clears every option, and shows the indeterminate state when only some are selected.",
      },
    },
  },
  render: () => (
    <CheckboxGroup
      allValues={CHANNELS.map((c) => c.value)}
      aria-label="Notification channels"
      defaultValue={["email"]}
    >
      <Label>
        <Checkbox parent={true} />
        All channels
      </Label>
      <div className="flex flex-col items-start gap-3 ps-6">
        <Options />
      </div>
    </CheckboxGroup>
  ),
};

function ControlledGroup() {
  const [value, setValue] = useState<string[]>(["email"]);
  return (
    <div className="flex flex-col gap-3">
      <CheckboxGroup
        aria-label="Notification channels"
        onValueChange={setValue}
        value={value}
      >
        <Options />
      </CheckboxGroup>
      <p className="text-muted-foreground text-sm" role="status">
        Selected: {value.length > 0 ? value.join(", ") : "none"}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledGroup />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "SMS" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Selected: email, sms",
    );
  },
};
