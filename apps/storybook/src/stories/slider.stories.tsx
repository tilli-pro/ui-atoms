import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider, SliderValue } from "@tilli.dev/ui-atoms/slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    min: {
      control: { type: "number" },
      description: "Minimum value",
    },
    max: {
      control: { type: "number" },
      description: "Maximum value",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <Slider aria-label="Value" {...args} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <p
        style={{
          fontSize: "0.75rem",
          color: "#666",
          marginBottom: "0.5rem",
        }}
      >
        Price range (two thumbs)
      </p>
      <Slider
        defaultValue={[20, 80]}
        getAriaLabel={(index) =>
          index === 0 ? "Minimum price" : "Maximum price"
        }
        max={100}
        min={0}
      />
    </div>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Slider aria-label="Volume" defaultValue={[65]} max={100} min={0}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#666" }}>Volume</span>
          <SliderValue />
        </div>
      </Slider>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.25rem",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#666" }}>0%</span>
        <span style={{ fontSize: "0.75rem", color: "#666" }}>100%</span>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Slider
        aria-label="Value"
        defaultValue={[40]}
        disabled={true}
        max={100}
        min={0}
      />
    </div>
  ),
};
