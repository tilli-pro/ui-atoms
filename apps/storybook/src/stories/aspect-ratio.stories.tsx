import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@tilli.dev/ui-atoms/aspect-ratio";

const meta = {
  title: "Components/AspectRatio",
  component: AspectRatio,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <AspectRatio ratio={16 / 9}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--muted)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div style={{ width: "200px" }}>
      <AspectRatio ratio={1}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--muted)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Ratios: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: "400px",
      }}
    >
      {(
        [
          { ratio: 4 / 3, label: "4:3 — Standard" },
          { ratio: 16 / 9, label: "16:9 — Widescreen" },
          { ratio: 21 / 9, label: "21:9 — Ultrawide" },
        ] as const
      ).map(({ ratio, label }) => (
        <div key={label}>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              marginBottom: "0.25rem",
            }}
          >
            {label}
          </p>
          <AspectRatio ratio={ratio}>
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--muted)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
              }}
            >
              {label.split(" — ")[0]}
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  ),
};
