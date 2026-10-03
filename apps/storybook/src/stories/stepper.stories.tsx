import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@tilli.dev/ui-atoms/stepper";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Stepper defaultValue={2} style={{ width: "500px" }}>
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Step 1</StepperTitle>
            <StepperDescription>Account info</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Step 2</StepperTitle>
            <StepperDescription>Verification</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={3}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Step 3</StepperTitle>
            <StepperDescription>Complete</StepperDescription>
          </div>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Stepper defaultValue={2} orientation="vertical" style={{ width: "300px" }}>
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Create Account</StepperTitle>
            <StepperDescription>
              Enter your email and password
            </StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Verify Identity</StepperTitle>
            <StepperDescription>Confirm your email address</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={3}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Connect Utility</StepperTitle>
            <StepperDescription>Link your utility account</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={4}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Done</StepperTitle>
            <StepperDescription>You're all set</StepperDescription>
          </div>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),
};

export const Completed: Story = {
  render: () => (
    <Stepper defaultValue={4} style={{ width: "500px" }}>
      <StepperItem step={1}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Account Created</StepperTitle>
            <StepperDescription>Email registered</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Identity Verified</StepperTitle>
            <StepperDescription>Email confirmed</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={3}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Utility Connected</StepperTitle>
            <StepperDescription>Account linked</StepperDescription>
          </div>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem step={4}>
        <StepperTrigger>
          <StepperIndicator />
          <div>
            <StepperTitle>Setup Complete</StepperTitle>
            <StepperDescription>You're all set!</StepperDescription>
          </div>
        </StepperTrigger>
      </StepperItem>
    </Stepper>
  ),
};
