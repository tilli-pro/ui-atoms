---
"@tilli.dev/ui-atoms": minor
---

`sidebar` is re-based on coss's own Base UI sidebar (`.coss-base/sidebar.tsx` at the pinned
revision). Our divergences stay (SBR-1..7): exported width constants with the 14rem default,
the 7-year state cookie, the zero-delay `TooltipProvider`, the OS-aware rail title,
`type="button"` on `SidebarMenuButton`, `SidebarTriggerMobile`, and a `document.cookie`
fallback where the Cookie Store API is missing. New from the base: `SidebarContent` scrolls
inside `ScrollArea` with a fade, icon sizing yields to a `size-*` class on the icon, logical
(RTL-safe) spacing, `SidebarContext` and `sidebarMenuButtonVariants` are exported.

New `./composer`: coss's composer (input with `@`-style trigger tokens, popup list, status,
actions, submit) with its editor libs under `src/lib/composer-*.ts` and the
`useComposerEditor` hook.

`./hooks` now exports `useMediaQuery` (coss's breakpoint-aware hook, also the new
implementation behind `useIsMobile`) and `useCopyToClipboard`.

New `./chat`: coss's chat kit (post-pin, taken wholesale with imports rewritten) — a
composite rather than an atom. `ChatConversation` with the `useChatScroll` controller,
`ChatMessage` and its layout parts (`ChatMessageLayout`, `ChatMessageAvatar`,
`ChatMessageHeader`, `ChatMessageContent`, `ChatMessageFooter`), bubbles, `ChatMessageText`
with mentions, collapsible long messages, delivery and typing indicators, reaction chips and
picker, the message action toolbar, reply preview and reply reference, member lists and
message info, date pill, unread divider, and empty/loading/status states. Its animations
use `motion`, which stays an optional peer: install it to import `./chat`.
