"use client";

// coss base `.coss-base/chat/chat-collapsible-message.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "../../utils.js";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "../collapsible/index.js";
import { splitChatMessagePreview } from "./lib/split-chat-message-preview.js";

export type ChatCollapsibleMessageProps = {
  text: string;
  showMoreLabel: string;
  showLessLabel: string;
  side: "incoming" | "outgoing";
  maxPreviewLength?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderText?: (text: string) => ReactNode;
  className?: string;
};

function renderPlainText(text: string): ReactElement {
  return (
    <p className="m-0 whitespace-pre-wrap break-words text-sm leading-[1.55]">
      {text}
    </p>
  );
}

function ChatCollapsibleMessage({
  text,
  showMoreLabel,
  showLessLabel,
  side,
  maxPreviewLength,
  defaultOpen = false,
  open,
  onOpenChange,
  renderText = renderPlainText,
  className,
}: ChatCollapsibleMessageProps): ReactElement {
  const { preview, remainder } = splitChatMessagePreview(
    text,
    maxPreviewLength,
  );
  if (!remainder) {
    return <div className={cn("min-w-0", className)}>{renderText(text)}</div>;
  }

  return (
    <ExpandableChatMessage
      className={className}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      open={open}
      preview={preview}
      renderText={renderText}
      showLessLabel={showLessLabel}
      showMoreLabel={showMoreLabel}
      side={side}
      text={text}
    />
  );
}

function ExpandableChatMessage({
  text,
  preview,
  renderText,
  showMoreLabel,
  showLessLabel,
  side,
  className,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
}: {
  text: string;
  preview: string;
  renderText: (text: string) => ReactNode;
  showMoreLabel: string;
  showLessLabel: string;
  side: "incoming" | "outgoing";
  className?: string;
  defaultOpen: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}): ReactElement {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (nextOpen: boolean): void => {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const Icon = open ? ChevronUpIcon : ChevronDownIcon;

  return (
    <Collapsible
      className={cn("flex min-w-0 flex-col", className)}
      onOpenChange={setOpen}
      open={open}
    >
      <div className="grid">
        <div
          aria-hidden={open || undefined}
          className={cn(
            "mask-[linear-gradient(to_bottom,black_calc(100%-3rem),transparent)] col-start-1 row-start-1 self-start",
            open && "invisible",
          )}
          data-slot="chat-collapsible-preview"
        >
          {renderText(preview)}
        </div>
        <CollapsiblePanel className="col-start-1 row-start-1 min-w-0 motion-reduce:transition-none">
          <div
            aria-hidden={!open || undefined}
            className={open ? undefined : "invisible"}
          >
            {renderText(text)}
          </div>
        </CollapsiblePanel>
      </div>
      <CollapsibleTrigger
        className={cn(
          "mt-2 flex w-fit items-center gap-1 text-start text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
          side === "outgoing"
            ? "text-foreground/80 hover:text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
        type="button"
      >
        {open ? showLessLabel : showMoreLabel}
        <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      </CollapsibleTrigger>
    </Collapsible>
  );
}

export { ChatCollapsibleMessage, splitChatMessagePreview };
