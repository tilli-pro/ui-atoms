// coss base `.coss-base/chat/chat-unread-divider.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ComponentProps, ReactElement } from "react";
import { cn } from "../../utils.js";

export function ChatUnreadDivider({
  children,
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        "my-4 flex items-center gap-3 font-medium text-foreground text-xs",
        className,
      )}
      data-slot="chat-unread-divider"
      {...props}
    >
      <span aria-hidden="true" className="h-px flex-1 bg-input" />
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-input" />
    </div>
  );
}
