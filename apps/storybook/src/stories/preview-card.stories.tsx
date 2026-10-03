import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@tilli.dev/ui-atoms/preview-card";

const meta = {
  title: "Components/PreviewCard",
  component: PreviewCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof PreviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PreviewCard>
      <PreviewCardTrigger>Hover me for preview</PreviewCardTrigger>
      <PreviewCardPopup>
        <div style={{ padding: "1rem" }}>
          <p style={{ fontWeight: 600 }}>Preview Title</p>
          <p>Some preview content here.</p>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  ),
};
