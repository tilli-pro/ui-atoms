// coss base `.coss-base/chat/chat-states.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement, ReactNode } from "react";
import { Children } from "react";
import { cn } from "../../utils.js";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../empty/index.js";
import { Skeleton } from "../skeleton/index.js";
import {
  ChatMessageAvatar,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageLayout,
} from "./chat-message-layout.js";

export type ChatEmptyStateProps = {
  title: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  children?: ReactNode;
};

export function ChatEmptyState({
  title,
  description,
  icon,
  children,
}: ChatEmptyStateProps): ReactElement {
  return (
    <Empty className="min-h-64 gap-4 py-10 md:py-10" role="status">
      <EmptyHeader>
        <EmptyMedia className="mb-2 bg-popover" variant="icon">
          {icon}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {Children.toArray(children).length > 0 && (
        <EmptyContent>{children}</EmptyContent>
      )}
    </Empty>
  );
}

const LOADING_ROWS = [
  { id: "first", side: "incoming" },
  { id: "second", side: "outgoing" },
  { id: "third", side: "incoming" },
  { id: "fourth", side: "outgoing" },
] as const;

export function ChatLoadingState({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}): ReactElement {
  return (
    <div className="flex flex-col gap-5 py-4" role="status">
      <span className="sr-only">{label}</span>
      {LOADING_ROWS.map(({ side, id }) => (
        <ChatMessageLayout
          align={side === "outgoing" ? "end" : "start"}
          aria-hidden="true"
          key={id}
        >
          {side === "incoming" && (
            <>
              <ChatMessageHeader>
                <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
              </ChatMessageHeader>
              <ChatMessageAvatar>
                <Skeleton className="size-7 rounded-full motion-reduce:animate-none" />
              </ChatMessageAvatar>
            </>
          )}
          <ChatMessageContent>
            <Skeleton
              className={cn(
                "h-11 w-56 max-w-[83%] rounded-2xl motion-reduce:animate-none",
                side === "incoming" ? "rounded-ss-md" : "rounded-se-md",
              )}
            />
            <Skeleton className="mx-1 h-2 w-9 motion-reduce:animate-none" />
          </ChatMessageContent>
        </ChatMessageLayout>
      ))}
      {children}
    </div>
  );
}

export function ChatStatusBar({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}): ReactElement {
  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 border-border/60 border-y bg-muted/72 px-5 py-2.5"
      role="status"
    >
      <div className="text-xs">
        <p className="m-0 font-medium">{title}</p>
        <p className="m-0 mt-1 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
