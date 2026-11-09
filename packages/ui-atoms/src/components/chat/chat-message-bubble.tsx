"use client";

// coss base `.coss-base/chat/chat-message-bubble.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../utils.js";
import { ChatBubble, type ChatBubbleProps } from "./chat-bubble.js";

export type ChatMessageBubbleProps = Omit<
  ChatBubbleProps,
  "align" | "variant" | "grouped" | "render"
> & {
  side: "incoming" | "outgoing";
  firstInGroup?: boolean;
  animateEntrance?: boolean;
  highlighted?: boolean;
  onAnimationComplete?: () => void;
};

export function ChatMessageBubble({
  side,
  firstInGroup = true,
  animateEntrance = false,
  highlighted = false,
  children,
  className,
  onAnimationComplete,
  ...props
}: ChatMessageBubbleProps): ReactElement {
  const reduceMotion = useReducedMotion();
  const entranceOrigin =
    side === "outgoing"
      ? "origin-top-right rtl:origin-top-left"
      : "origin-top-left rtl:origin-top-right";
  return (
    <ChatBubble
      {...props}
      align={side === "outgoing" ? "end" : "start"}
      className={cn(highlighted ? "origin-center" : entranceOrigin, className)}
      data-slot="chat-message-bubble"
      grouped={!firstInGroup}
      render={
        <motion.div
          animate={highlighted && !reduceMotion ? "attention" : "rest"}
          initial={
            animateEntrance && !reduceMotion
              ? { transform: "scale(0.92)" }
              : false
          }
          onAnimationComplete={onAnimationComplete}
          variants={{
            rest: {
              transform: "scale(1)",
              transition: reduceMotion
                ? { duration: 0 }
                : { type: "spring", duration: 0.35, bounce: 0.45 },
            },
            attention: {
              transform: ["scale(1)", "scale(1.05)", "scale(1)"],
              transition: {
                duration: 0.42,
                times: [0, 0.28, 1],
                ease: [
                  [0.16, 1, 0.3, 1],
                  [0.34, 1.56, 0.64, 1],
                ],
              },
            },
          }}
        />
      }
      variant={side === "outgoing" ? "default" : "muted"}
    >
      {children}
      {highlighted && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-foreground/25 ring-offset-2 ring-offset-background"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.42, times: [0, 0.28, 1], ease: "easeOut" }}
        />
      )}
    </ChatBubble>
  );
}
