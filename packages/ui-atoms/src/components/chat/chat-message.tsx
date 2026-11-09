// coss base `.coss-base/chat/chat-message.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement, ReactNode } from "react";
import { cn } from "../../utils.js";
import { ChatBubbleReactions } from "./chat-bubble.js";
import {
  ChatMessageBubble,
  type ChatMessageBubbleProps,
} from "./chat-message-bubble.js";
import {
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageFooter,
  ChatMessageHeader,
  ChatMessageLayout,
  type ChatMessageLayoutProps,
} from "./chat-message-layout.js";
import { ChatMessageText } from "./chat-message-text.js";

type ChatMessageAnimationProps = Pick<
  ChatMessageBubbleProps,
  "animateEntrance" | "highlighted" | "onAnimationComplete"
>;

export type ChatMessageProps = Omit<
  ChatMessageLayoutProps,
  "align" | "children"
> &
  ChatMessageAnimationProps & {
    side: "incoming" | "outgoing";
    author?: ReactNode;
    avatar?: ReactNode;
    grouped?: boolean;
    lifted?: boolean;
    children: ReactNode;
    actions?: ReactNode;
    reactions?: ReactNode;
    footer?: ReactNode;
    bubble?: boolean;
    bubbleProps?: Omit<
      ChatMessageBubbleProps,
      "side" | "firstInGroup" | "children" | keyof ChatMessageAnimationProps
    >;
  };

export function ChatMessage({
  side,
  author,
  avatar,
  grouped = false,
  lifted = false,
  children,
  actions,
  reactions,
  footer,
  bubble = true,
  bubbleProps,
  animateEntrance,
  highlighted,
  onAnimationComplete,
  ...props
}: ChatMessageProps): ReactElement {
  const own = side === "outgoing";
  return (
    <ChatMessageLayout align={own ? "end" : "start"} {...props}>
      {!(own || grouped) && author && (
        <ChatMessageHeader className={lifted ? "invisible" : undefined}>
          {author}
        </ChatMessageHeader>
      )}
      {!own && avatar && (
        <ChatMessageAvatar className={lifted ? "invisible" : undefined}>
          {!grouped && avatar}
        </ChatMessageAvatar>
      )}
      <ChatMessageContent>
        {bubble ? (
          <div
            className={cn(
              "flex w-full min-w-0 items-center gap-2",
              own && "flex-row-reverse",
            )}
          >
            <div className="relative min-w-0 max-w-[83%] shrink">
              <ChatMessageBubble
                {...bubbleProps}
                animateEntrance={animateEntrance}
                className={cn(lifted && "invisible", bubbleProps?.className)}
                firstInGroup={!grouped}
                highlighted={highlighted}
                onAnimationComplete={onAnimationComplete}
                side={side}
              >
                {typeof children === "string" ? (
                  <ChatMessageText text={children} />
                ) : (
                  children
                )}
              </ChatMessageBubble>
            </div>
            {actions}
          </div>
        ) : (
          children
        )}
        {reactions && <ChatBubbleReactions>{reactions}</ChatBubbleReactions>}
        {footer && <ChatMessageFooter>{footer}</ChatMessageFooter>}
      </ChatMessageContent>
    </ChatMessageLayout>
  );
}
