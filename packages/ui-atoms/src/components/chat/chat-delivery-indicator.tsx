// coss base `.coss-base/chat/chat-delivery-indicator.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement } from "react";
import {
  CheckCheckIcon,
  CheckIcon,
  CircleAlertIcon,
  ClockIcon,
} from "lucide-react";
import { cn } from "../../utils.js";

export type ChatDeliveryIndicatorProps = {
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  label: string;
};

export function ChatDeliveryIndicator({
  status,
  label,
}: ChatDeliveryIndicatorProps): ReactElement {
  const Icon = {
    sending: ClockIcon,
    sent: CheckIcon,
    delivered: CheckCheckIcon,
    read: CheckCheckIcon,
    failed: CircleAlertIcon,
  }[status];

  return (
    <span
      aria-label={label}
      data-slot="chat-delivery-indicator"
      role="img"
      title={label}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-3",
          status === "read" && "text-sky-600 dark:text-sky-400",
          status === "failed" && "text-destructive",
        )}
      />
    </span>
  );
}
