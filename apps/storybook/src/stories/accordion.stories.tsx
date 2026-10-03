import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@tilli.dev/ui-atoms/accordion";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Accordion",
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
      <AccordionItem value="item-3">
        <AccordionTrigger>Section Three</AccordionTrigger>
        <AccordionPanel>Content for section three.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion defaultValue={["item-1"]} style={{ width: "400px" }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One (open by default)</AccordionTrigger>
        <AccordionPanel>
          This section starts open because defaultValue includes "item-1".
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionPanel>Content for section two.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section Three</AccordionTrigger>
        <AccordionPanel>Content for section three.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleOpen: Story = {
  render: () => (
    <Accordion multiple={false} style={{ width: "400px" }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionPanel>
          Only one section can be open at a time in single mode.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionPanel>Opening this closes the previous one.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section Three</AccordionTrigger>
        <AccordionPanel>Content for section three.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion style={{ width: "400px" }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One (enabled)</AccordionTrigger>
        <AccordionPanel>This section is interactive.</AccordionPanel>
      </AccordionItem>
      <AccordionItem disabled={true} value="item-2">
        <AccordionTrigger>Section Two (disabled)</AccordionTrigger>
        <AccordionPanel>This content is not accessible.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section Three (enabled)</AccordionTrigger>
        <AccordionPanel>This section is interactive.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Accordion>
      <AccordionItem value="one">
        <AccordionTrigger>One</AccordionTrigger>
        <AccordionPanel>Body one</AccordionPanel>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "One" }));
    // The panel mounts with `data-starting-style` and fades/slides in over a
    // CSS transition, so the visibility check needs to retry through it —
    // `storybook/test`'s `expect` does not poll.
    await waitFor(() => expect(c.getByText("Body one")).toBeVisible());
  },
};
