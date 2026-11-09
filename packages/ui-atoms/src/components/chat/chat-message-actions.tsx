"use client";

// coss base `.coss-base/chat/chat-message-actions.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.
// `../toolbar/index.js` is our toolbar (still the v2 port, measure-first), not coss's. It
// exports the same `Toolbar` / `ToolbarButton` the base imports, and its root differs only in
// `bg-clip-padding` (coss: `not-dark:bg-clip-padding`), moot under chat's `bg-transparent`.

import type { ComponentProps, ReactElement, ReactNode, RefObject } from "react";
import { useRef, useState } from "react";
import { CornerDownLeftIcon, EllipsisIcon } from "lucide-react";
import { Button } from "../button/index.js";
import { Menu, MenuPopup, MenuTrigger } from "../menu/index.js";
import { Toolbar, ToolbarButton } from "../toolbar/index.js";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../tooltip/index.js";
import { useChatPopupDismissal } from "./hooks/use-chat-popup-dismissal.js";

export type ChatMessageActionToolbarProps = {
  side: "incoming" | "outgoing";
  toolbarLabel: string;
  reactionPicker?: (toolbarRef: RefObject<HTMLDivElement | null>) => ReactNode;
  menuTriggerRef?: RefObject<HTMLButtonElement | null>;
  menuFinalFocus?: ComponentProps<typeof MenuPopup>["finalFocus"];
} & (
  | { onReply: () => void; replyLabel: string; replyTooltip: string }
  | { onReply?: never; replyLabel?: never; replyTooltip?: never }
) &
  (
    | { menuChildren: ReactNode; moreLabel: string; moreTooltip: string }
    | { menuChildren?: never; moreLabel?: never; moreTooltip?: never }
  );

export function ChatMessageActionToolbar({
  side,
  toolbarLabel,
  reactionPicker,
  replyLabel,
  replyTooltip,
  onReply,
  moreLabel,
  moreTooltip,
  menuChildren,
  menuTriggerRef: suppliedMenuTriggerRef,
  menuFinalFocus,
}: ChatMessageActionToolbarProps): ReactElement | null {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuDismissedOutside, setMenuDismissedOutside] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const ownMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = suppliedMenuTriggerRef ?? ownMenuTriggerRef;

  useChatPopupDismissal(menuOpen, menuTriggerRef, () => setMenuOpen(false));

  if (!(reactionPicker || onReply || menuChildren)) return null;

  return (
    <Toolbar
      aria-label={toolbarLabel}
      className="z-10 min-w-max flex-none items-center gap-0 self-center rounded-full bg-transparent p-0.5 opacity-0 pointer-coarse:opacity-100 transition-opacity group-hover/message:opacity-100 has-data-popup-open:opacity-100 has-focus-visible:opacity-100 motion-reduce:transition-none"
      data-slot="chat-message-action-toolbar"
      ref={toolbarRef}
    >
      {reactionPicker?.(toolbarRef)}
      {onReply && (
        <Tooltip>
          <TooltipTrigger
            render={
              <ToolbarButton
                render={
                  <Button
                    aria-label={replyLabel}
                    className="pointer-coarse:size-8 rounded-full before:rounded-full"
                    onClick={onReply}
                    onMouseDown={(event) => {
                      if (event.button === 0) event.preventDefault();
                    }}
                    size="icon-xs"
                    variant="ghost"
                  />
                }
              />
            }
          >
            <CornerDownLeftIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipPopup>{replyTooltip}</TooltipPopup>
        </Tooltip>
      )}
      {menuChildren && (
        <Menu
          onOpenChange={(open, details) => {
            setMenuDismissedOutside(
              details.reason === "outside-press" ||
                details.reason === "focus-out",
            );
            setMenuOpen(open);
          }}
          open={menuOpen}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton
                  render={
                    <MenuTrigger
                      ref={menuTriggerRef}
                      render={
                        <Button
                          aria-label={moreLabel}
                          className="pointer-coarse:size-8 rounded-full before:rounded-full"
                          data-message-actions=""
                          size="icon-xs"
                          variant="ghost"
                        />
                      }
                    />
                  }
                />
              }
            >
              <EllipsisIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipPopup>{moreTooltip}</TooltipPopup>
          </Tooltip>
          <MenuPopup
            align={side === "outgoing" ? "start" : "end"}
            anchor={toolbarRef}
            finalFocus={menuDismissedOutside ? false : menuFinalFocus}
          >
            {menuChildren}
          </MenuPopup>
        </Menu>
      )}
    </Toolbar>
  );
}
