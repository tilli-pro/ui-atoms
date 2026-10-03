import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@tilli.dev/ui-atoms/button";
import { Checkbox } from "@tilli.dev/ui-atoms/checkbox";
import { Form } from "@tilli.dev/ui-atoms/form";
import { Input } from "@tilli.dev/ui-atoms/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";

const meta = {
  title: "Components/Form",
  component: Form,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Form
      onSubmit={(e) => e.preventDefault()}
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <input
        placeholder="Name"
        style={{
          padding: "0.5rem",
          border: "1px solid var(--border)",
          borderRadius: "0.375rem",
        }}
      />
      <input
        placeholder="Email"
        style={{
          padding: "0.5rem",
          border: "1px solid var(--border)",
          borderRadius: "0.375rem",
        }}
        type="email"
      />
      <button
        style={{
          padding: "0.5rem",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          borderRadius: "0.375rem",
          border: "none",
        }}
        type="submit"
      >
        Submit
      </button>
    </Form>
  ),
};

export const RealisticForm: Story = {
  render: () => (
    <Form
      onSubmit={(e) => e.preventDefault()}
      style={{
        width: "380px",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.125rem",
            fontWeight: 600,
          }}
        >
          Create an account
        </h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
          Fill in your details to get started.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <label
            htmlFor="form-first-name"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            First name
          </label>
          <Input id="form-first-name" placeholder="Jane" />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
          }}
        >
          <label
            htmlFor="form-last-name"
            style={{ fontSize: "0.8rem", fontWeight: 500 }}
          >
            Last name
          </label>
          <Input id="form-last-name" placeholder="Doe" />
        </div>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="form-email"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Email address
        </label>
        <Input id="form-email" placeholder="jane@example.com" type="email" />
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="form-password"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Password
        </label>
        <Input id="form-password" placeholder="••••••••" type="password" />
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="form-country"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Country
        </label>
        <Select>
          <SelectTrigger id="form-country">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectPopup>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="gb">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="fr">France</SelectItem>
          </SelectPopup>
        </Select>
      </div>

      <div
        style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}
      >
        <Checkbox id="marketing-form" style={{ marginTop: "2px" }} />
        <div>
          <label
            htmlFor="marketing-form"
            style={{ fontSize: "0.8rem", fontWeight: 500, display: "block" }}
          >
            Marketing communications
          </label>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#666",
              margin: "0.125rem 0 0",
            }}
          >
            Receive updates about new features and products.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox id="terms-form" />
        <label htmlFor="terms-form" style={{ fontSize: "0.8rem" }}>
          I agree to the{" "}
          <a
            href="https://example.com/terms"
            style={{ textDecoration: "underline" }}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://example.com/privacy"
            style={{ textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
        </label>
      </div>

      <Button type="submit">Create account</Button>
    </Form>
  ),
};

export const WithValidation: Story = {
  render: () => (
    <Form
      onSubmit={(e) => e.preventDefault()}
      style={{
        width: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        padding: "1.5rem",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
      }}
    >
      <div>
        <h2
          style={{
            margin: "0 0 0.25rem",
            fontSize: "1.125rem",
            fontWeight: 600,
          }}
        >
          Sign in
        </h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
          Error states shown for demonstration.
        </p>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="form-validation-email"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Email address
        </label>
        <Input
          aria-invalid={true}
          defaultValue="not-an-email"
          id="form-validation-email"
          type="email"
        />
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--destructive)",
            margin: "0.125rem 0 0",
          }}
        >
          Please enter a valid email address.
        </p>
      </div>

      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
      >
        <label
          htmlFor="form-validation-password"
          style={{ fontSize: "0.8rem", fontWeight: 500 }}
        >
          Password
        </label>
        <Input
          aria-invalid={true}
          id="form-validation-password"
          placeholder="••••••••"
          type="password"
        />
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--destructive)",
            margin: "0.125rem 0 0",
          }}
        >
          Password is required.
        </p>
      </div>

      <div
        style={{
          padding: "0.75rem",
          background: "color-mix(in srgb, var(--destructive) 10%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
          borderRadius: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--destructive-foreground)",
        }}
      >
        Invalid credentials. Please check your email and password.
      </div>

      <Button type="submit" variant="default">
        Sign in
      </Button>
    </Form>
  ),
};
