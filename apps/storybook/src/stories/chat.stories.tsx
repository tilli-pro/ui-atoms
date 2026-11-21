import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback } from "@tilli.dev/ui-atoms/avatar";
import {
  ChatCollapsibleMessage,
  ChatConversation,
  ChatDeliveryIndicator,
  ChatMessage,
  ChatMessageText,
  ChatTypingIndicator,
  useChatScroll,
} from "@tilli.dev/ui-atoms/chat";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Chat",
  component: ChatMessage,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

function Initials({ children }: { children: string }) {
  return (
    <Avatar className="[--avatar-size:--spacing(7)]">
      <AvatarFallback>{children}</AvatarFallback>
    </Avatar>
  );
}

function Conversation({ typing = false }: { typing?: boolean }) {
  const scroll = useChatScroll({ itemCount: 4 });
  return (
    <div className="flex h-96 w-96 max-w-full flex-col rounded-xl border">
      <ChatConversation jumpLabel="Latest" label="Messages" scroll={scroll}>
        <ChatMessage
          author="Ada"
          avatar={<Initials>AL</Initials>}
          side="incoming"
        >
          Did the invoice batch go out this morning?
        </ChatMessage>
        <ChatMessage
          footer={<ChatDeliveryIndicator label="Read" status="read" />}
          side="outgoing"
        >
          Yes, all 240 were sent at 9:00.
        </ChatMessage>
        <ChatMessage
          author="Ada"
          avatar={<Initials>AL</Initials>}
          side="incoming"
        >
          <ChatMessageText
            mentions={["sam"]}
            text="Thanks. @sam can you confirm the totals?"
          />
        </ChatMessage>
        <ChatMessage
          footer={<ChatDeliveryIndicator label="Sending" status="sending" />}
          side="outgoing"
        >
          I will check with him after lunch.
        </ChatMessage>
        <ChatTypingIndicator label="Sam is typing" visible={typing} />
      </ChatConversation>
    </div>
  );
}

export const Default: Story = {
  args: { children: "Message", side: "incoming" },
  render: () => <Conversation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("log", { name: "Messages" }),
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("article")).toHaveLength(4);
  },
};

export const Typing: Story = {
  args: { children: "Message", side: "incoming" },
  render: () => <Conversation typing={true} />,
};

export const DeliveryStates: Story = {
  args: { children: "Message", side: "outgoing" },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {(["sending", "sent", "delivered", "read", "failed"] as const).map(
        (status) => (
          <ChatMessage
            footer={<ChatDeliveryIndicator label={status} status={status} />}
            key={status}
            side="outgoing"
          >
            {`Status: ${status}`}
          </ChatMessage>
        ),
      )}
    </div>
  ),
};

export const LongMessage: Story = {
  args: { children: "Message", side: "incoming" },
  render: () => (
    <div className="w-80">
      <ChatCollapsibleMessage
        maxPreviewLength={120}
        showLessLabel="Show less"
        showMoreLabel="Show more"
        side="incoming"
        text={`${"The reconciliation ran overnight and matched every payment except three. ".repeat(3)}\n\nThe three exceptions are listed in the attached report.`}
      />
    </div>
  ),
};
