import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tilli.dev/ui-atoms/empty";

const meta = {
  title: "Components/Empty",
  component: Empty,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">📭</EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>
          No items match your search criteria.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <p>Try adjusting your filters.</p>
      </EmptyContent>
    </Empty>
  ),
};
