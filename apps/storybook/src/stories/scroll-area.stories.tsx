import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "@tilli.dev/ui-atoms/scroll-area";

const meta = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea
      style={{
        height: "200px",
        width: "300px",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <p key={i} style={{ padding: "0.25rem 0" }}>
          Item {i + 1}
        </p>
      ))}
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea
      style={{
        width: "350px",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1rem",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.75rem",
              background: "var(--muted)",
              borderRadius: "0.5rem",
              minWidth: "80px",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>📦</span>
            <span style={{ fontSize: "0.75rem" }}>Item {i + 1}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const BothDirections: Story = {
  render: () => (
    <ScrollArea
      style={{
        height: "200px",
        width: "350px",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      <div style={{ width: "700px" }}>
        {Array.from({ length: 20 }, (_, row) => (
          <div
            key={row}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}
          >
            {Array.from({ length: 8 }, (_, col) => (
              <div
                key={col}
                style={{
                  minWidth: "80px",
                  padding: "0.25rem 0.5rem",
                  background: "var(--muted)",
                  borderRadius: "0.25rem",
                  fontSize: "0.75rem",
                  textAlign: "center",
                }}
              >
                R{row + 1}C{col + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
