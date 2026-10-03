import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectExample({
  size,
  disabled,
}: {
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}) {
  return (
    <Select disabled={disabled}>
      <SelectTrigger size={size}>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectPopup>
    </Select>
  );
}

export const Default: Story = {
  render: () => <SelectExample />,
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <SelectExample disabled={true} />
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectPopup>
          <SelectGroup>
            <SelectGroupLabel>Citrus</SelectGroupLabel>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="lemon">Lemon</SelectItem>
            <SelectItem value="lime">Lime</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Berries</SelectGroupLabel>
            <SelectItem value="strawberry">Strawberry</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="raspberry">Raspberry</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Tropical</SelectGroupLabel>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
            <SelectItem value="papaya">Papaya</SelectItem>
          </SelectGroup>
        </SelectPopup>
      </Select>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="No options available" />
        </SelectTrigger>
        <SelectPopup>{/* Empty — no items */}</SelectPopup>
      </Select>
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
        <div key={size}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#666",
              marginBottom: "0.25rem",
            }}
          >
            {size}
          </p>
          <SelectExample size={size} />
        </div>
      ))}
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const items = [
      { label: "Apple", value: "apple" },
      { label: "Pear", value: "pear" },
    ];
    return (
      <Select items={items}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectPopup>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    );
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", {
      name: "Fruit",
    });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Pear" }));
    await expect(trigger).toHaveTextContent("Pear");
    // Selecting closes the popup, but base-ui's focus-guard cleanup for the
    // portalled popup runs after that close transition — waiting for the
    // popup to actually leave the document gives it time to finish before
    // the post-interaction axe scan runs against the whole page, otherwise
    // an intermittently-still-focusable guard span flakes `aria-hidden-focus`.
    await waitFor(() =>
      expect(
        screen.queryByRole("option", { name: "Pear" }),
      ).not.toBeInTheDocument(),
    );
  },
};
