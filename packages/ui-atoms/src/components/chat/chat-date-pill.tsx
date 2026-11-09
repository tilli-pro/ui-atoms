// coss base `.coss-base/chat/chat-date-pill.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ComponentProps, ReactElement } from "react";
import { cn } from "../../utils.js";

export function ChatDatePill({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        "pointer-events-none sticky top-4 z-20 mx-auto flex h-6 w-fit items-center justify-center rounded-full border bg-popover/90 px-2 font-medium text-foreground text-xs backdrop-blur-xs",
        className,
      )}
      data-slot="chat-date-pill"
      {...props}
    />
  );
}
