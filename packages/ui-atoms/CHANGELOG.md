# @tilli.dev/ui-atoms

## 1.1.0

### Minor Changes

- 36c5487: The coss base moves from `8163481` (2026-09-16) to `b2336c4` (2026-11-17), and every upstream
  change since is ported.
  
  New in `./avatar`: `AvatarGroup` (overlapping avatars, each cut out around its neighbour;
  `topmost="first" | "last"`) and `AvatarGroupCount`, with `AvatarGroupPrimitive`,
  `avatarGroupVariants` and `avatarGroupCountVariants`. An avatar's size is now the
  `--avatar-size` custom property (default `--spacing(8)`, as before), which also scales the
  fallback text; `--avatar-gap`, `--avatar-overlap` and `--avatar-nudge` tune a group.
  
  Visible changes:
  
  - `DialogTitle`, `AlertDialogTitle`, `DrawerTitle` and `EmptyTitle` are `font-bold` (were
    `font-semibold`).
  - `AvatarFallback` is `bg-border` (was `bg-muted`), and `Avatar` no longer paints
    `bg-background` behind a transparent image.
  - A bottom `Drawer` pads its top by the safe-area inset instead of a fixed `pt-12`, and moves
    above the on-screen keyboard (`Drawer.VirtualKeyboardProvider`).
  - `Textarea`'s wrapper is `inline-grid` (was `inline-flex`).
  - The calendar's month dropdown is formatted by the active date library, so it follows the
    `locale` prop instead of the browser's.
  
  Fixes taken from upstream:
  
  - Reduced motion: dialogs fade without scaling or sliding, toasts fade in place and skip the
    result animation, and the tabs indicator does not slide.
  - RTL: the switch thumb, and the switch-style checkbox items in `menu`, `context-menu` and
    the drawer menu, travel the right way.
  - iOS Safari: dialog, alert-dialog and command backdrops cover the page behind the dynamic
    toolbar; the composer's submit button no longer steals focus from the input, and an empty
    composer inside a drawer no longer pans the page on focus.
  
  Kept ahead of the base: `ComboboxChipRemove` still defaults `aria-label="Remove"` (the base
  dropped it; Base UI 1.8.0 gives the icon-only button no name of its own).
  
  Provenance: `carousel` and `resizable` are recorded as derived from shadcn/ui (pinned under
  `.shadcn-base/`), which they always were; THIRD-PARTY-NOTICES is corrected to say so.
  
  `sheet` is re-based on coss's sheet (it was the last v2 implementation of a dialog-like
  surface). New: `SheetPanel`, the padded, scrolling body — the old sheet had no body part, so
  content placed after `SheetHeader` ran edge to edge; `SheetViewport`; `variant="inset"` on
  `SheetPopup` (a rounded, floating sheet from `sm:` up); `variant="bare"` on `SheetFooter`;
  `closeProps` and `portalProps` on `SheetPopup`; and the `*Primitive` parts and cva variants
  (`sheetPopupVariants`, …). Every existing export name is kept, including the `SheetContent`
  and `SheetOverlay` aliases. Visible changes: a right or left sheet is `max-w-md` (was
  `max-w-sm`) with a border on its inner edge, the header is `p-6` with a `text-xl` bold title,
  the footer is a right-aligned row on a muted band, the close control is a ghost icon button,
  and the sheet fades and slides 2rem in instead of sliding its full width. Wrap body content
  in `SheetPanel` when migrating.
  
  **Breaking for `./resizable` users:** the optional peer `react-resizable-panels` moves from
  `^3` to `^4`, and the component is re-ported onto shadcn/ui's 4.x resizable. The three
  exports are unchanged, but their props are 4.x's: `direction` is now `orientation`; a
  numeric size is pixels and a percentage is a string (`defaultSize={50}` becomes
  `defaultSize="50%"`); `autoSaveId` is replaced by the library's `useDefaultLayout`; and
  `onLayout` is `onLayoutChange`. Selectors keyed on `data-panel-group-direction` must move
  to `aria-orientation`.
  
  `./resizable` also follows the package conventions now: `ResizableHandleGrip` is its own
  part (pass children to swap the icon), the `*Primitive` parts and the cva variants
  (`resizableHandleVariants`, `resizableHandleGripVariants`, `resizablePanelGroupVariants`)
  are exported, focus is the same halo the inputs use, the line takes the ring colour
  on hover and while dragging, and a disabled handle fades.
  
  The optional `motion` peer now also accepts 13 and 14 (`./chat`, `./number-ticker` and
  `./spinning-text` are tested on 14). Development moves to `@base-ui/react` 1.9.0; the peer
  range (`>=1.8.0 <2`) is unchanged.
  
  Accessibility: a calendar day button's accessible name now contains the number it shows
  (WCAG 2.5.3). In English that means "Sunday, November 1, 2026" where it was "Sunday,
  November 1st, 2026"; locales whose long date already uses the plain number are unchanged,
  and a `labels.labelDayButton` you pass still takes precedence. Tests that look a day up by
  its full name need the ordinal removed.
- 8de46f5: `sidebar` is re-based on coss's own Base UI sidebar (`.coss-base/sidebar.tsx` at the pinned
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

### Patch Changes

- 746429a: `dark:` utilities now apply inside a dark theme. The variant in `styles.css` was defined as
  `&:is([data-theme="dark"])`, which matches only the element that carries the attribute, so
  with `data-theme="dark"` on `<html>` none of the `dark:` classes in any component took
  effect; dark mode looked mostly right only because the colour tokens swap through CSS
  variables. It is now `&:where([data-theme="dark"], [data-theme="dark"] *)`.
  
  Visible in dark mode: inputs, textareas, selects and similar fields get their translucent
  `input` background, popups and cards get their top highlight instead of the light theme's
  bottom shadow, the tabs indicator and segmented surfaces use `input`, and focus rings and
  invalid states use their dark values. Light mode is unchanged. If you worked around this by
  restating `dark:` styles under your own selector, those overrides can go.
  
  `data-theme="system-dark"` is accepted as a second dark value, for both the `dark:` variant
  and the dark tokens. It is what a theme script writes when the user has made no choice and
  the OS is dark, so a page can tell a followed preference from an explicit one.
- 1f1a26d: `menu`, `context-menu`, `select`, `autocomplete` and `combobox` popups animate open and closed
  again. Base UI sets `data-starting-style` / `data-ending-style` on the Popup element; coss's older
  shape reacted to them from a wrapper `<span>` with `has-data-starting-style:` rules, and when the
  base moved the classes onto the Popup (MNU-2) it dropped the transition instead of rewriting it,
  while its popover kept one. Autocomplete and combobox still have the frame `<span>`, but the base
  kept only `transition-[scale,opacity]` on it with no starting or ending rules.
  
  Menu, context-menu and select now carry `transition-[scale,opacity]` with `data-starting-style:`
  and `data-ending-style:` scale/opacity rules on the element Base UI marks (MNU-7, CTX-2, SEL-3);
  autocomplete and combobox carry the same as `has-data-starting-style:` / `has-data-ending-style:`
  rules on their frame span (ACP-2, CBX-8). All five fade and scale in, and stay mounted through the
  exit transition instead of unmounting at once.

## 1.0.0

### Major Changes

- First public release. React 19 + Tailwind CSS v4 components on `@base-ui/react`, derived from the coss ui registry: flat per-part exports, styled + `*Primitive` + cva variants for every part, `render`-prop composition, `data-slot` selectors, an unbundled ESM build that preserves `"use client"` directives, and the canonical `styles.css` theme in light and dark. Documentation: https://tilli-pro.github.io/ui-atoms/
