import { describe, expect, it } from "vitest";
import {
  ChatCollapsibleMessage,
  ChatConversation,
  ChatDeliveryIndicator,
  ChatMemberSection,
  ChatMessage,
  ChatMessageText,
  ChatTypingIndicator,
  splitChatMessagePreview,
  useChatScroll,
} from "../../../src/components/chat/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// coss's chat kit, taken wholesale from `.coss-base/chat/` (post-pin). One smoke render
// per family of parts, through the flat `./chat` barrel.
describe("chat (coss kit)", () => {
  it("renders an incoming message as an article with author, avatar and a motion bubble", () => {
    render(
      <ChatMessage author="Ada" avatar={<span>A</span>} side="incoming">
        Hello there
      </ChatMessage>,
    );
    const article = screen.getByRole("article");
    expectSlot(article, "chat-message");
    expect(article.getAttribute("data-align")).toBe("start");
    expect(screen.getByText("Ada").getAttribute("data-slot")).toBe(
      "chat-message-header",
    );
    const bubble = document.querySelector('[data-slot="chat-message-bubble"]');
    expect(bubble?.getAttribute("data-variant")).toBe("muted");
    expect(bubble?.textContent).toBe("Hello there");
  });

  it("aligns an outgoing message to the end and drops the author header", () => {
    render(
      <ChatMessage author="Me" side="outgoing">
        Sent
      </ChatMessage>,
    );
    expect(screen.getByRole("article").getAttribute("data-align")).toBe("end");
    expect(screen.queryByText("Me")).toBeNull();
  });

  it("emphasises only the listed @mentions", () => {
    render(<ChatMessageText mentions={["ada"]} text="hi @ada and @bob." />);
    const strong = document.querySelectorAll(".font-medium");
    expect([...strong].map((el) => el.textContent)).toEqual(["@ada"]);
  });

  it("labels the delivery state and the typing indicator for assistive tech", () => {
    render(
      <>
        <ChatDeliveryIndicator label="Read" status="read" />
        <ChatTypingIndicator label="Ada is typing" />
      </>,
    );
    expect(screen.getByRole("img", { name: "Read" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Ada is typing");
  });

  it("renders nothing for a hidden typing indicator or an empty member section", () => {
    const { container } = render(
      <>
        <ChatTypingIndicator label="typing" visible={false} />
        <ChatMemberSection label="Read by" members={[]} />
      </>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("collapses a long message behind a show-more trigger", () => {
    const text = `${"word ".repeat(30)}\n\n${"tail ".repeat(10)}`.trim();
    expect(splitChatMessagePreview(text, 100).remainder).not.toBeNull();
    render(
      <ChatCollapsibleMessage
        maxPreviewLength={100}
        showLessLabel="Show less"
        showMoreLabel="Show more"
        side="incoming"
        text={text}
      />,
    );
    expectSlot(
      screen.getByRole("button", { name: "Show more" }),
      "collapsible-trigger",
    );
  });

  it("wires useChatScroll into a labelled log viewport", () => {
    function Conversation() {
      const scroll = useChatScroll({ itemCount: 1 });
      return (
        <ChatConversation jumpLabel="Latest" label="Messages" scroll={scroll}>
          <ChatMessage side="incoming">One</ChatMessage>
        </ChatConversation>
      );
    }
    render(<Conversation />);
    const log = screen.getByRole("log", { name: "Messages" });
    expectSlot(log, "scroll-area-viewport");
    expect(log.textContent).toContain("One");
  });
});
