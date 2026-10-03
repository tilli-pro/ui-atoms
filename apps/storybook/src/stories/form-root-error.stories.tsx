import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormRootError } from "@tilli.dev/ui-atoms/form-root-error";

const meta = {
  title: "Components/FormRootError",
  component: FormRootError,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FormRootError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <FormRootError message="Something went wrong. Please try again." />
    </div>
  ),
};

export const LongError: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <FormRootError message="We were unable to process your request at this time. This may be due to a network issue or a temporary server problem. Please check your connection and try again. If the problem persists, contact support at support@example.com." />
    </div>
  ),
};
