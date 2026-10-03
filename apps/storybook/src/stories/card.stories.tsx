import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: "350px" }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardPanel>
        <p>Card content area.</p>
      </CardPanel>
      <CardFooter>
        <p>Card footer</p>
      </CardFooter>
    </Card>
  ),
};

export const MinimalCard: Story = {
  render: () => (
    <Card style={{ width: "350px" }}>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardPanel>
        <p>Your account is in good standing. Next payment due Jan 15, 2026.</p>
      </CardPanel>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card style={{ width: "400px" }}>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>
          Update your name and contact information.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div>
            <label
              htmlFor="card-name"
              style={{
                display: "block",
                fontSize: "0.875rem",
                marginBottom: "0.25rem",
              }}
            >
              Full Name
            </label>
            <input
              defaultValue="Jane Doe"
              id="card-name"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="card-email"
              style={{
                display: "block",
                fontSize: "0.875rem",
                marginBottom: "0.25rem",
              }}
            >
              Email
            </label>
            <input
              defaultValue="jane@example.com"
              id="card-email"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
              type="email"
            />
          </div>
        </div>
      </CardPanel>
      <CardFooter
        style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
      >
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Card style={{ width: "400px" }}>
      <CardHeader>
        <CardTitle>Terms of Service</CardTitle>
        <CardDescription>Last updated January 1, 2026</CardDescription>
      </CardHeader>
      <CardPanel>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            fontSize: "0.875rem",
          }}
        >
          <p>
            Welcome to tilliX. By using our services, you agree to these terms.
            Please read them carefully before proceeding with account creation.
          </p>
          <p>
            <strong>1. Account Responsibility.</strong> You are responsible for
            maintaining the confidentiality of your account credentials and for
            all activity that occurs under your account.
          </p>
          <p>
            <strong>2. Acceptable Use.</strong> You agree not to misuse our
            services. This includes attempting to access accounts that don't
            belong to you or engaging in fraudulent transactions.
          </p>
          <p>
            <strong>3. Data Privacy.</strong> We collect and process personal
            data as described in our Privacy Policy. Your data is encrypted and
            never sold to third parties.
          </p>
          <p>
            <strong>4. Termination.</strong> We reserve the right to suspend or
            terminate accounts that violate these terms at our sole discretion.
          </p>
        </div>
      </CardPanel>
      <CardFooter
        style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
      >
        <Button variant="outline">Decline</Button>
        <Button>Accept & Continue</Button>
      </CardFooter>
    </Card>
  ),
};
