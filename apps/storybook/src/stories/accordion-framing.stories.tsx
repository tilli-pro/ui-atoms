import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@tilli.dev/ui-atoms/accordion";

const meta = {
  title: "Components/Accordion Framing",
  component: Accordion,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion style={{ width: "400px" }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionPanel>Content for section one.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionPanel>Content for section two.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion defaultValue={["item-1"]} style={{ width: "400px" }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Billing Information</AccordionTrigger>
        <AccordionPanel>
          Your billing cycle renews on the 1st of every month. Invoices are sent
          to the email address on file.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Payment Methods</AccordionTrigger>
        <AccordionPanel>
          You can add credit cards, debit cards, or bank accounts as payment
          methods.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Cancellation Policy</AccordionTrigger>
        <AccordionPanel>
          You may cancel your subscription at any time. Access continues until
          the end of the current billing period.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const AllOpen: Story = {
  render: () => (
    <Accordion
      defaultValue={["faq-1", "faq-2", "faq-3"]}
      multiple={true}
      style={{ width: "400px" }}
    >
      <AccordionItem value="faq-1">
        <AccordionTrigger>What is tilliX?</AccordionTrigger>
        <AccordionPanel>
          tilliX is a modern financial management platform designed to simplify
          billing and payments for utilities and services.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger>How do I get started?</AccordionTrigger>
        <AccordionPanel>
          Sign up for a free account, connect your utility accounts, and start
          tracking your bills in minutes.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger>Is my data secure?</AccordionTrigger>
        <AccordionPanel>
          Yes. All data is encrypted at rest and in transit. We use
          industry-standard security practices and are SOC 2 compliant.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};
