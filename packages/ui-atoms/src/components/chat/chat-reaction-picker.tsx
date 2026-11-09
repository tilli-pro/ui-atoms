"use client";

// coss base `.coss-base/chat/chat-reaction-picker.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.
// `../toolbar/index.js` is our toolbar (still the v2 port, measure-first), not coss's. It
// exports the same `Toolbar` / `ToolbarButton` the base imports, and its root differs only in
// `bg-clip-padding` (coss: `not-dark:bg-clip-padding`), moot under chat's `bg-transparent`.

import type { ComponentProps, ReactElement } from "react";
import { useRef, useState } from "react";
import { HeartIcon } from "lucide-react";
import { Button } from "../button/index.js";
import { Popover, PopoverPopup, PopoverTrigger } from "../popover/index.js";
import { ToolbarButton } from "../toolbar/index.js";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../tooltip/index.js";
import { useChatPopupDismissal } from "./hooks/use-chat-popup-dismissal.js";

export type ChatReactionPickerProps = {
  inToolbar?: boolean;
  options: readonly { emoji: string; label: string }[];
  selectedEmojis: readonly string[];
  triggerLabel: string;
  triggerTooltip: string;
  popupLabel: string;
  popupAlign?: ComponentProps<typeof PopoverPopup>["align"];
  popupAnchor?: ComponentProps<typeof PopoverPopup>["anchor"];
  onSelect: (emoji: string) => void;
};

export function ChatReactionPicker({
  inToolbar = false,
  options,
  selectedEmojis,
  triggerLabel,
  triggerTooltip,
  popupLabel,
  popupAlign,
  popupAnchor,
  onSelect,
}: ChatReactionPickerProps): ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useChatPopupDismissal(open, triggerRef, () => setOpen(false));

  const trigger = (
    <PopoverTrigger
      ref={triggerRef}
      render={
        <Button
          aria-label={triggerLabel}
          className="pointer-coarse:size-8 rounded-full before:rounded-full"
          onMouseDown={(event) => {
            if (event.button === 0) event.preventDefault();
          }}
          size="icon-xs"
          variant="ghost"
        />
      }
    />
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <Tooltip>
        <TooltipTrigger
          render={inToolbar ? <ToolbarButton render={trigger} /> : trigger}
        >
          <HeartIcon aria-hidden="true" className="size-3.5" />
        </TooltipTrigger>
        <TooltipPopup>{triggerTooltip}</TooltipPopup>
      </Tooltip>
      <PopoverPopup
        align={popupAlign}
        anchor={popupAnchor}
        aria-label={popupLabel}
        className="transform-gpu rounded-full before:rounded-full **:data-[slot=popover-viewport]:p-1"
        finalFocus={(interaction) => interaction === "keyboard"}
        initialFocus={(interaction) => interaction === "keyboard"}
        side="top"
      >
        <div className="flex">
          {options.map(({ emoji, label }) => (
            <Button
              aria-label={label}
              aria-pressed={selectedEmojis.includes(emoji)}
              className="rounded-full before:rounded-full"
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              onMouseDown={(event) => {
                if (event.button === 0) event.preventDefault();
              }}
              size="icon-lg"
              variant="ghost"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {emoji}
              </span>
            </Button>
          ))}
        </div>
      </PopoverPopup>
    </Popover>
  );
}
