// coss base `.coss-base/chat/chat-jump-to-latest-button.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement, ReactNode } from "react";
import { ArrowDownIcon } from "lucide-react";
import { cn } from "../../utils.js";
import { Button, type ButtonProps } from "../button/index.js";

export type ChatJumpToLatestButtonProps = Omit<
  ButtonProps,
  "children" | "size" | "variant"
> & {
  children: ReactNode;
};

export function ChatJumpToLatestButton({
  className,
  children,
  ...props
}: ChatJumpToLatestButtonProps): ReactElement {
  return (
    <div
      className="rounded-full bg-popover/90 backdrop-blur-xs"
      data-slot="chat-jump-to-latest"
    >
      <Button
        className={cn(
          "pointer-events-auto gap-2 rounded-full before:rounded-full",
          className,
        )}
        size="xs"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon aria-hidden="true" />
        {children}
      </Button>
    </div>
  );
}
