"use client";

// coss base `.coss-base/chat/chat-reaction-chip.tsx`, digest-pinned in scripts/coss/coss-lock.json
// (post-pin item: see the lock entry's `provenance`), taken wholesale with imports rewritten.

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../utils.js";
import { Popover, PopoverPopup, PopoverTrigger } from "../popover/index.js";
import { Toggle } from "../toggle/index.js";
import { useChatPopupDismissal } from "./hooks/use-chat-popup-dismissal.js";

export type ChatReactionChipProps = {
  animateEntrance?: boolean;
  emoji: string;
  count: number;
  selected: boolean;
  label: string;
  onClick: () => void;
  reactorContent?: ReactNode;
  reactorLabel?: string;
  popupAlign?: ComponentProps<typeof PopoverPopup>["align"];
  className?: string;
};

export function ChatReactionChip({
  animateEntrance = false,
  emoji,
  count,
  selected,
  label,
  onClick,
  className,
  reactorContent,
  reactorLabel,
  popupAlign,
}: ChatReactionChipProps): ReactElement {
  const reduceMotion = useReducedMotion();
  const [animateReaction, setAnimateReaction] = useState(false);
  const previouslySelected = useRef(selected);
  useEffect(() => {
    setAnimateReaction(selected && !previouslySelected.current);
    previouslySelected.current = selected;
  }, [selected]);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const clearHold = useCallback((): void => {
    if (holdTimer.current !== null) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }, []);

  useEffect(() => clearHold, [clearHold]);

  useChatPopupDismissal(open, triggerRef, () => {
    clearHold();
    if (touchOrigin.current) suppressClick.current = true;
    touchOrigin.current = null;
    setOpen(false);
  });

  const chip = (
    <Toggle
      aria-label={label}
      className={cn(
        "h-6 min-w-0 gap-1 rounded-full px-2 text-xs shadow-none transition-transform duration-150 [-webkit-touch-callout:none] before:rounded-full active:scale-95 data-pressed:border-primary/48 data-pressed:bg-primary/12 motion-reduce:scale-100 motion-reduce:transition-none sm:h-6 sm:min-w-0 sm:text-xs dark:data-pressed:bg-primary/8",
        className,
      )}
      data-slot="chat-reaction-chip"
      onPressedChange={(_, details) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          details.cancel();
          return;
        }
        onClick();
      }}
      pressed={selected}
      size="sm"
      variant="outline"
    >
      <motion.span
        animate={
          animateReaction && !reduceMotion
            ? {
                transform: [
                  "scale(1) rotate(0deg)",
                  "scale(1.55) rotate(-12deg)",
                  "scale(1.12) rotate(6deg)",
                  "scale(1) rotate(0deg)",
                ],
              }
            : { transform: "scale(1) rotate(0deg)" }
        }
        className="inline-flex"
        initial={false}
        transition={{
          duration: reduceMotion ? 0 : 0.44,
          times: [0, 0.35, 0.65, 1],
          ease: "easeOut",
        }}
      >
        {emoji}
      </motion.span>
      <span className="tabular-nums">{count}</span>
    </Toggle>
  );

  const content = !reactorContent ? (
    chip
  ) : (
    <Popover
      onOpenChange={(nextOpen, details) => {
        if (details.reason === "trigger-press") {
          details.cancel();
          return;
        }
        if (
          details.reason === "trigger-hover" &&
          !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
          details.cancel();
          return;
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <span className="inline-flex" ref={anchorRef}>
        <PopoverTrigger
          closeDelay={150}
          delay={300}
          onBlur={(event) => {
            if (!popupRef.current?.contains(event.relatedTarget))
              setOpen(false);
          }}
          onContextMenu={(event) => {
            if (touchOrigin.current || suppressClick.current)
              event.preventDefault();
          }}
          onFocus={(event) => {
            if (
              event.currentTarget.matches(":focus-visible") &&
              !touchOrigin.current
            )
              setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ")
              suppressClick.current = false;
          }}
          onPointerCancel={() => {
            clearHold();
            touchOrigin.current = null;
            suppressClick.current = true;
            setOpen(false);
          }}
          onPointerDown={(event) => {
            suppressClick.current = false;
            if (event.pointerType !== "touch" || !event.isPrimary) return;
            touchOrigin.current = { x: event.clientX, y: event.clientY };
            clearHold();
            holdTimer.current = setTimeout(() => {
              holdTimer.current = null;
              suppressClick.current = true;
              setOpen(true);
            }, 500);
          }}
          onPointerMove={(event) => {
            const origin = touchOrigin.current;
            if (
              !origin ||
              Math.hypot(event.clientX - origin.x, event.clientY - origin.y) <=
                8
            )
              return;
            clearHold();
            suppressClick.current = true;
            touchOrigin.current = null;
            setOpen(false);
          }}
          onPointerUp={() => {
            clearHold();
            touchOrigin.current = null;
          }}
          openOnHover={true}
          ref={triggerRef}
          render={chip}
        />
      </span>
      <PopoverPopup
        align={popupAlign}
        anchor={anchorRef}
        aria-label={reactorLabel}
        className="w-52 **:data-[slot=popover-viewport]:p-1.5"
        finalFocus={false}
        initialFocus={false}
        ref={popupRef}
      >
        {reactorContent}
      </PopoverPopup>
    </Popover>
  );

  return (
    <motion.span
      animate={{ opacity: 1, transform: "scale(1)" }}
      className={cn(
        "inline-flex origin-top",
        animateEntrance && !reduceMotion && "will-change-transform",
      )}
      initial={
        animateEntrance && !reduceMotion
          ? { opacity: 0, transform: "scale(0.55)" }
          : false
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              transform: { type: "spring", duration: 0.44, bounce: 0.45 },
              opacity: { duration: 0.12 },
            }
      }
    >
      {content}
    </motion.span>
  );
}
