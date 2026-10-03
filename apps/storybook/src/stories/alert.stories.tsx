import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@tilli.dev/ui-atoms/alert";
import { Button } from "@tilli.dev/ui-atoms/button";

const VARIANTS = ["default", "info", "success", "warning", "error"] as const;

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Default Alert</AlertTitle>
      <AlertDescription>This is a default alert message.</AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "400px",
      }}
    >
      {VARIANTS.map((variant) => (
        <Alert key={variant} variant={variant}>
          <AlertTitle>{variant}</AlertTitle>
          <AlertDescription>
            This is a {variant} alert message.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Alert style={{ width: "400px" }} variant="warning">
      <AlertTitle>Session Expiring Soon</AlertTitle>
      <AlertDescription>
        Your session will expire in 5 minutes. Save your work to avoid losing
        changes.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Extend Session
        </Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Alert style={{ width: "400px" }} variant="info">
      <AlertTitle>Important Notice About Your Account</AlertTitle>
      <AlertDescription>
        We have updated our terms of service and privacy policy. These changes
        affect how we collect, store, and use your personal data. Please review
        the updated documents carefully. By continuing to use the service after
        the effective date of January 1, 2026, you agree to the new terms.
        Contact support if you have any questions or concerns about these
        changes.
      </AlertDescription>
    </Alert>
  ),
};
