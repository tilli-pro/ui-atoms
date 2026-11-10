# @tilli.dev/ui-atoms parts inventory for list-view and dashboard mocks

Package: `/Users/g1n/tilli/ui-atoms/packages/ui-atoms`. It is built with React 19, Tailwind v4 and `@base-ui/react` (>=1.8 <2), following coss ui conventions.

## Imports and general conventions

**How a recipe imports**
- One subpath per component: `import { Table, TableRow } from "@tilli.dev/ui-atoms/table"`.
- `cn` comes from `"@tilli.dev/ui-atoms/utils"`. It is `twMerge(clsx(...))`.
- Hooks come from `"@tilli.dev/ui-atoms/hooks"`.
- Formatters come from `"@tilli.dev/ui-atoms/formatters"`.
- CSS comes from `"@tilli.dev/ui-atoms/styles.css"`.
- The enterprise-ui-ux recipe currently imports sidebar, utils, skeleton, menu, card and avatar.
- Icons come from `lucide-react`, which is a dependency of both ui-atoms and the playground.

**Export pattern used by most parts**
- `<Part>` is the styled part.
- `<Part>Primitive` is unstyled and carries only `data-slot`.
- `<part>Variants` is the cva class string.
- Builders should use the styled `<Part>`.

**`render` prop instead of `asChild`**
- Base UI parts and `useRender` parts take `render={<a href/>}` to re-tag the element. `asChild` is not used.
- `asChild` exists only on `TimelineIndicator` and `StepperIndicator`, which are origin-ui style.

**shadcn aliases that are kept**
- `CardContent` = `CardPanel`
- `TabsTrigger` / `TabsContent` = `TabsTab` / `TabsPanel`
- `PopoverContent` = `PopoverPopup`
- `SheetContent` / `SheetOverlay`
- `AccordionContent`
- `CollapsibleContent`
- `HoverCard*` = `PreviewCard*`
- `ButtonGroup*` = `Group*`
- `RadioGroupItem` = `Radio`
- `SelectContent` = `SelectPopup`
- `AlertDialogContent` / `AlertDialogOverlay`

**Built-in portals**
- Every popup part portals itself: `MenuPopup`, `PopoverPopup`, `TooltipPopup`, `SelectPopup`, `ComboboxPopup`, `DialogPopup`, `SheetPopup`, `DrawerPopup`, `PreviewCardPopup`.
- You do not need to add a `*Portal` wrapper.

**Handles**
- `*CreateHandle` exists for dialog, menu, popover, tooltip, command and drawer. Use it for detached triggers.

**Optional peer dependencies the playground does not list**
- These four parts depend on optional peers that are missing from `apps/playground/package.json`:
  - calendar needs `@daypicker/react`
  - tree needs `@headless-tree/core`
  - carousel needs `embla-carousel-react`
  - resizable needs `react-resizable-panels`
- They may still resolve through the workspace link. Check that before using them, or avoid them.
- `motion` is present in the playground, so number-ticker and spinning-text work.

## Not in the library
There is no chart/graph/sparkline part, no map, no kanban/board, no rich-text editor (`composer` is a token/mention input, not rich text), no data-grid/data-table (no sorting, column resizing or virtualization), no date-range picker part, no stat/KPI tile and no file upload/dropzone.
- **KPI tiles:** compose them from Card + NumberTicker + Meter/Progress + Badge.
- **Charts:** hand-roll SVG.
- **Grids:** use the plain `table` parts and manage sorting/selection state yourself.

There is also no story for chat, composer, context-menu, autocomplete, segmented-control, number-ticker or spinning-text (the number-ticker and spinning-text sections below come from the source).

---

## table
- **Exports:** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, the `*Primitive` versions, `type TableVariant`.
- **Shape:** `Table > TableHeader > TableRow > TableHead`, then `TableBody > TableRow > TableCell`, plus an optional `TableFooter` and `TableCaption`.
- **Props:**
  - `variant?: "default" | "card"`. `card` uses separated borders and is styled through `data-variant` on the container.
  - `containerProps` goes to the wrapping `div` (`overflow-x-auto`).
  - `render` re-tags the container.
  - Other parts take plain HTML props.
- **Style:** coss-style, built on `useRender`.
- **Caveats:**
  - No sorting, selection or sticky flags. Row and cell flags were removed.
  - Add checkboxes, sort buttons and sticky classes yourself.
  - Pairs with `Frame` for a framed list.

## badge
- **Exports:** `Badge`, `BadgePrimitive`, `badgeVariants`.
- **Shape:** single element.
- **Props:**
  - `variant`: `default | secondary | outline | destructive | error | info | success | warning`
  - `size`: `sm | default | lg`
  - `render`, for example `render={<a/>}`
- **Style:** `useRender`.

## tabs
- **Exports:** `Tabs`, `TabsList`, `TabsTab` (alias `TabsTrigger`), `TabsPanel` (alias `TabsContent`), primitives, `TabsSize`, `TabsVariant`.
- **Shape:** `Tabs > TabsList > TabsTab*`, then `TabsPanel*`.
- **Props:**
  - `Tabs` takes `value`, `defaultValue`, `onValueChange` and `orientation` (horizontal or vertical).
  - `TabsList` takes `variant: "default" | "underline"` and `size: sm | default | lg`. The list size reaches every tab through context.
  - `TabsTab` and `TabsPanel` take `value`.
- **Style:** Base UI Tabs.
- **Caveats:** the active indicator renders automatically.

## toggle-group
- **Exports:** `ToggleGroup`, `ToggleGroupItem`, `ToggleGroupSeparator`, `ToggleGroupContext`, `ToggleGroupPrimitive`.
- **Shape:** `ToggleGroup > ToggleGroupItem*`, with an optional `ToggleGroupSeparator`.
- **Props:**
  - `value: string[]`, `defaultValue`, `onValueChange`, `multiple` (Base UI; single selection by default).
  - `orientation`: horizontal or vertical.
  - `variant: default | outline` and `size: sm | default | lg`. Both reach items through context.
  - `ToggleGroupItem` takes `value`.
- **Style:** Base UI ToggleGroup.
- **Caveats:** the value is always an array, even for single selection.
- **Related:** the `toggle` subpath exports `Toggle` with `variant: default | outline`, `size: sm | default | lg`, `pressed` and `onPressedChange`.

## segmented-control
- **Exports:** `SegmentedControl`, `SegmentedControlOption`, `SegmentedControlProps`.
- **Shape:** single component, data-driven.
- **Props:** `options: {label, value}[]`, `value: string` (required), `onChange(value)`, `disabled`, `id`, `ariaLabelledBy`, `className`.
- **Style:** custom, not Base UI.
- **Caveats:**
  - Fully controlled only; you must keep the value in state.
  - Has no size prop.

## empty
- **Exports:** `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, primitives.
- **Shape:** `Empty > EmptyHeader > (EmptyMedia > icon) + EmptyTitle + EmptyDescription`, then `EmptyContent` (holds action buttons).
- **Props:** `EmptyMedia` takes `variant: "default" | "icon"`. `icon` draws a stacked tile and sizes the svg automatically.
- **Style:** coss/shadcn.

## pagination
- **Exports:** `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`, primitives.
- **Shape:** `Pagination(nav) > PaginationContent(ul) > PaginationItem(li) > PaginationLink | PaginationPrevious | PaginationNext | PaginationEllipsis`.
- **Props:**
  - `PaginationLink` takes `isActive` (renders outline instead of ghost and sets `aria-current=page`), `size` (Button sizes, default `icon`), `href` and `render`.
  - Previous and Next take the same props as `PaginationLink`.
- **Style:** shadcn-style on `useRender`.
- **Caveats:**
  - Renders anchors. Use `render={<button/>}` or `onClick` for client state.
  - Has no "rows per page" or page-count logic; compose those with `Select`.

## input-group
- **Exports:** `InputGroup`, `InputGroupAddon`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`, primitives.
- **Shape:** `InputGroup > InputGroupAddon(align) > (icon | InputGroupText | Button | Kbd)`, then `InputGroupInput` or `InputGroupTextarea`.
- **Props:** `InputGroupAddon` takes `align: inline-start (default) | inline-end | block-start | block-end`. `InputGroupInput` takes the `Input` props.
- **Style:** coss.
- **Caveats:** this is the search-box pattern: `InputGroup` + `InputGroupAddon` (SearchIcon) + `InputGroupInput` + `InputGroupAddon` aligned `inline-end` (Kbd).

## input
- **Exports:** `Input`, `InputPrimitive`, `inputVariants`, `inputControlVariants`.
- **Shape:** single element. It renders a `span[data-slot=input-control]` that wraps the `input`.
- **Props:** `size: "sm" | "default" | "lg" | number`, `unstyled`, `nativeInput` (uses a plain `<input>` instead of Base UI Input), plus standard input props.
- **Style:** Base UI Input.
- **Caveats:** the `className` lands on the wrapper span.

## select
- **Exports:** `Select`, `SelectTrigger`, `SelectValue`, `SelectPopup` (alias `SelectContent`), `SelectItem`, `SelectGroup`, `SelectGroupLabel`, `SelectSeparator`, `SelectLabel`, `SelectButton`, `SelectPrimitive` (the raw Base UI select).
- **Shape:** `Select > SelectTrigger > SelectValue`, then `SelectPopup > SelectItem*`, optionally inside `SelectGroup` with `SelectGroupLabel`.
- **Props:**
  - `Select` takes `value`, `defaultValue`, `onValueChange`, `items`, `multiple`.
  - `SelectTrigger` takes `size: sm | default | lg`.
  - `SelectPopup` takes `side` (default bottom), `sideOffset`, `alignItemWithTrigger` (default true) and `listProps`.
  - `SelectItem` takes `value`.
- **Style:** Base UI Select.
- **Caveats:**
  - Pass `items` (an array of `{label, value}` or a map) to `Select` so `SelectValue` shows the label rather than the raw value.
  - The trigger has `min-w-36` and `w-full`.

## combobox
- **Exports:** `Combobox`, `ComboboxInput`, `ComboboxTrigger`, `ComboboxClear`, `ComboboxValue`, `ComboboxPopup`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxGroupLabel`, `ComboboxSeparator`, `ComboboxStatus`, `ComboboxRow`, `ComboboxCollection`, `ComboboxChips`, `ComboboxChip`, `ComboboxChipRemove`, `ComboboxChipsInput`, `ComboboxContext`, `createComboboxItems`, `useComboboxFilter`.
- **Shape:**
  - Single select: `Combobox items={...} > ComboboxInput`, then `ComboboxPopup > ComboboxEmpty + ComboboxList > {(item) => <ComboboxItem value={item}/>}`.
  - Multi select: `ComboboxChips > ComboboxChip* + ComboboxChipsInput`.
- **Props:**
  - `Combobox` takes `items`, `value`, `onValueChange`, `multiple`, `itemToStringLabel`.
  - `ComboboxInput` and `ComboboxChipsInput` take `size: sm | default` and `startAddon`.
- **Style:** Base UI Combobox.
- **Caveats:** `ComboboxList` takes a render-function child.

## autocomplete
- **Exports:** the same part set as combobox under `Autocomplete*` (Input, Trigger, Clear, Value, Popup, List, Item, Empty, Group, GroupLabel, Separator, Status, Row, Collection) plus `useAutocompleteFilter`.
- **Shape:** `Autocomplete items > AutocompleteInput`, then `AutocompletePopup > AutocompleteEmpty + AutocompleteList > {(item) => <AutocompleteItem/>}`.
- **Props:** `AutocompleteInput` takes `size: sm | default` and `startAddon`. Value props are `value` (string) and `onValueChange`.
- **Style:** Base UI Autocomplete.
- **Caveats:** use it for free-text search with suggestions.

## command
- **Exports:**
  - `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandGroupLabel`, `CommandItem`, `CommandSeparator`, `CommandShortcut`, `CommandPanel`, `CommandFooter`, `CommandCollection`.
  - Dialog parts: `CommandDialog`, `CommandDialogTrigger`, `CommandDialogPopup`, `CommandDialogBackdrop`, `CommandDialogViewport`, `CommandDialogPortal`, `CommandCreateHandle`.
- **Shape:** `CommandDialog > CommandDialogTrigger`, then `CommandDialogPopup > Command items > CommandInput + CommandPanel > CommandList > {(item) => <CommandItem/>} | CommandGroup > CommandGroupLabel + CommandItem* + CommandShortcut`, then `CommandFooter`.
- **Props:**
  - `Command` takes `items`.
  - `CommandList` takes a render-function child.
  - `CommandDialog` takes `open` and `onOpenChange`.
- **Style:** coss command on Base UI Autocomplete inside Dialog (not cmdk).
- **Caveats:**
  - There is no `value` / `onSelect` as in cmdk. Use `onClick` on items or `onValueChange`.
  - A ⌘K hotkey must be wired yourself; `react-hotkeys-hook` is in the playground.

## tooltip
- **Exports:** `Tooltip`, `TooltipTrigger`, `TooltipPopup`, `TooltipProvider`, `TooltipCreateHandle`, `TooltipPopupPrimitive`.
- **Shape:** `Tooltip > TooltipTrigger render={<Button/>}`, then `TooltipPopup`.
- **Props:** `TooltipPopup` takes `side` (default top) and `sideOffset`. `TooltipProvider` takes `delay` (Base UI).
- **Style:** Base UI.
- **Caveats:** wrap a group in `TooltipProvider` to share the delay. It is optional.

## sheet
- **Exports:** `Sheet`, `SheetTrigger`, `SheetPopup` (alias `SheetContent`), `SheetBackdrop` (alias `SheetOverlay`), `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`, `SheetPortal`.
- **Shape:** `Sheet > SheetTrigger`, then `SheetPopup side > SheetHeader > SheetTitle + SheetDescription`, then body, then `SheetFooter`.
- **Props:**
  - `SheetPopup` takes `side: top | right (default) | bottom | left` and `showCloseButton` (default true).
  - `Sheet` takes `open` and `onOpenChange`.
- **Style:** Base UI Dialog, shadcn-style.
- **Caveats:** max-w-sm on right and left. This is the simple record side-panel; use `drawer` for a richer one.

## drawer
- **Exports:** `Drawer`, `DrawerTrigger`, `DrawerPopup`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerPanel`, `DrawerFooter`, `DrawerClose`, `DrawerBar`, `DrawerBackdrop`, `DrawerViewport`, `DrawerPortal`, `DrawerSwipeArea`, `DrawerCreateHandle`, plus a drawer-menu set (`DrawerMenu`, `DrawerMenuItem`, `DrawerMenuCheckboxItem`, `DrawerMenuRadioGroup`, `DrawerMenuRadioItem`, `DrawerMenuGroup`, `DrawerMenuGroupLabel`, `DrawerMenuSeparator`, `DrawerMenuTrigger`).
- **Shape:** `Drawer position > DrawerTrigger`, then `DrawerPopup > DrawerHeader > DrawerTitle + DrawerDescription`, then `DrawerPanel` (scrolling body), then `DrawerFooter`.
- **Props:**
  - `Drawer` takes `position: bottom (default) | top | left | right`, `open`, `onOpenChange`, and snap points (Base UI).
  - `DrawerPopup` takes `variant: default | inset | straight`, `showBar` and `showCloseButton` (default false).
  - `DrawerFooter` takes `variant: default | bare`.
  - `DrawerMenuItem` takes `variant: default | destructive`.
  - `DrawerMenuCheckboxItem` takes `variant: default | switch`.
- **Style:** Base UI Drawer (swipe).

## dialog
- **Exports:** `Dialog`, `DialogTrigger`, `DialogPopup`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogPanel`, `DialogFooter`, `DialogClose`, `DialogBackdrop`, `DialogViewport`, `DialogPortal`, `DialogCreateHandle`.
- **Shape:** `Dialog > DialogTrigger render={<Button/>}`, then `DialogPopup > DialogHeader > DialogTitle + DialogDescription`, then `DialogPanel` (scroll body), then `DialogFooter > DialogClose render={<Button variant="ghost"/>} + Button`.
- **Props:**
  - `DialogPopup` takes `showCloseButton` (default true) and `bottomStickOnMobile` (default true).
  - `DialogFooter` takes `variant: default | bare`.
  - `Dialog` takes `open` and `onOpenChange`.
- **Style:** Base UI Dialog, coss.
- **Related:** the `alert-dialog` subpath has the same shape as `AlertDialog*` (`AlertDialogPopup` alias `AlertDialogContent`) and has no `Panel`.

## timeline
- **Exports:** `Timeline`, `TimelineItem`, `TimelineHeader`, `TimelineSeparator`, `TimelineDate`, `TimelineTitle`, `TimelineIndicator`, `TimelineContent`.
- **Shape:** `Timeline > TimelineItem step={n} > TimelineHeader > TimelineSeparator + TimelineDate + TimelineTitle + TimelineIndicator`, then `TimelineContent`.
- **Props:**
  - `Timeline` takes `value`, `defaultValue`, `onValueChange` (the active step number) and `orientation: horizontal | vertical`.
  - `TimelineItem` takes `step` (required).
  - `TimelineIndicator` takes `asChild`.
- **Style:** origin-ui style, plain divs.
- **Caveats:** items with `step <= value` are styled completed. For an activity feed, set `value` to the last step. `TimelineDate` is a `<time>`.

## meter
- **Exports:** `Meter`, `MeterLabel`, `MeterTrack`, `MeterIndicator`, `MeterValue`.
- **Shape:** `Meter value > MeterLabel + MeterValue + MeterTrack > MeterIndicator`.
- **Props:** `value`, `min`, `max`, `format` (Intl options), `getAriaValueText`.
- **Style:** Base UI Meter.
- **Caveats:** use it for static quantities (quota, SLA attainment). Colour the `MeterIndicator` with `className`.

## progress
- **Exports:** `Progress`, `ProgressLabel`, `ProgressTrack`, `ProgressIndicator`, `ProgressValue`.
- **Shape:** `Progress value > [ProgressLabel + ProgressValue] + ProgressTrack > ProgressIndicator`. With no children it renders track and indicator automatically.
- **Props:** `value` (`null` means indeterminate), `min`, `max`, `format`.
- **Style:** Base UI Progress.

## avatar
- **Exports:** `Avatar`, `AvatarImage`, `AvatarFallback`, primitives.
- **Shape:** `Avatar > AvatarImage src + AvatarFallback` (initials).
- **Props:** no size variant; it is fixed at `size-8`. Override with `className="size-6"`.
- **Style:** Base UI Avatar.
- **Caveats:** for an avatar stack, use `-space-x-2` and a ring class.

## calendar
- **Exports:** `Calendar`, `CalendarTime`, primitives, variants.
- **Shape:** single `Calendar`.
- **Props:**
  - DayPicker props: `mode="single" | "range" | "multiple"`, `selected`, `onSelect`, `numberOfMonths`, `disabled`.
  - `showTime` with `timeProps` gives single date+time (`selected: Date`, `onSelect`).
- **Style:** `@daypicker/react` v10.
- **Caveats:**
  - Optional peer; see the playground note at the top.
  - No date-range-picker wrapper. Compose `Popover` + `Button` + `Calendar mode="range"`.

## breadcrumb
- **Exports:** `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`.
- **Shape:** `Breadcrumb(nav) > BreadcrumbList(ol) > BreadcrumbItem > BreadcrumbLink | BreadcrumbPage`, with `BreadcrumbSeparator` between items.
- **Props:** `BreadcrumbLink` takes `render` (for example a router Link) and `href`.
- **Style:** shadcn-style on `useRender`.

## toolbar
- **Exports:** `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarInput`, `ToolbarGroup`, `ToolbarSeparator`.
- **Shape:** `Toolbar > ToolbarGroup > ToolbarButton render={<Button/>}`, with `ToolbarSeparator` between groups.
- **Props:** `orientation` (Base UI).
- **Style:** Base UI Toolbar.
- **Caveats:** buttons are unstyled. Pass `render={<Button variant="ghost" size="sm"/>}` or `<Toggle/>`. Use it for list bulk-action bars.

## kbd
- **Exports:** `Kbd`, `KbdGroup`.
- **Shape:** `KbdGroup > Kbd*`.
- **Props:** plain `<kbd>` props.

## button
- **Exports:** `Button`, `ButtonPrimitive`, `buttonVariants`.
- **Props:**
  - `variant`: `default | secondary | outline | ghost | link | destructive`
  - `size`: `xs | sm | default | lg | xl | icon`
  - `render`, for example `render={<a href/>}`
  - `loading`: check the source (`ButtonProps` extends the primitive).
- **Style:** `useRender`.
- **Caveats:** `buttonVariants({variant, size})` gives the class string for non-button elements.

## card
- **Exports:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardPanel` (alias `CardContent`), `CardFooter`, plus the `CardFrame*` set (`CardFrame`, `CardFrameHeader`, `CardFrameTitle`, `CardFrameDescription`, `CardFrameAction`, `CardFrameFooter`), primitives.
- **Shape:** `Card > CardHeader > CardTitle + CardDescription + CardAction` (top-right slot), then `CardPanel`, then `CardFooter`.
- **CardFrame:** an outer framed shell that wraps a Card with its own header and footer band.
- **Props:** no variants. Each part takes `render`.
- **Style:** coss on `useRender`.
- **Caveats:** use it for the KPI tile (CardHeader with title and action menu, CardPanel with number and meter).

## frame
- **Exports:** `Frame`, `FrameHeader`, `FrameTitle`, `FrameDescription`, `FramePanel`, `FrameFooter`, primitives.
- **Shape:** `Frame > FrameHeader > FrameTitle + FrameDescription`, then `FramePanel*`, then `FrameFooter`.
- **Style:** coss.
- **Caveats:** this is the coss "frame" container for a table or list. Pair it with `Table variant="card"` inside a `FramePanel`, and put pagination in `FrameFooter`.

## separator
- **Exports:** `Separator`, `SeparatorPrimitive`.
- **Props:** `orientation: horizontal (default) | vertical`. Vertical stretches automatically.
- **Style:** Base UI.

## scroll-area
- **Exports:** `ScrollArea`, `ScrollBar`, `ScrollAreaPrimitive`.
- **Shape:** `ScrollArea > content`. Both scrollbars render automatically.
- **Props:** `scrollFade` (edge fade mask) and `scrollbarGutter`. `ScrollBar` takes `orientation`.
- **Style:** Base UI ScrollArea.
- **Caveats:** needs a constrained height via `className`.

## skeleton
- **Exports:** `Skeleton`, `SkeletonPrimitive`.
- **Props:** a plain div. Size it with `className`.

## menu
- **Exports:** `Menu`, `MenuTrigger`, `MenuPopup`, `MenuItem`, `MenuLinkItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuRadioItem`, `MenuGroup`, `MenuGroupLabel`, `MenuSeparator`, `MenuShortcut`, `MenuSub`, `MenuSubTrigger`, `MenuSubPopup`, `MenuPortal`, `MenuCreateHandle`.
- **Shape:** `Menu > MenuTrigger render={<Button/>}`, then `MenuPopup > MenuGroup > MenuGroupLabel + MenuItem* (+ MenuShortcut)`, `MenuSeparator`, `MenuSub > MenuSubTrigger + MenuSubPopup`.
- **Props:**
  - `MenuPopup` takes `side`, `sideOffset`, `align` and `anchor`.
  - `MenuItem` takes `variant: default | destructive`, `inset`, `onClick` and `closeOnClick`.
  - `MenuCheckboxItem` takes `variant: default | switch`, `checked` and `onCheckedChange`.
  - `MenuRadioGroup` takes `value` and `onValueChange`.
- **Style:** Base UI Menu.
- **Caveats:** use it for row actions (kebab), the column-visibility toggle (checkbox items) and sort choice (radio group).

## context-menu
- **Exports:** the same set as menu under `ContextMenu*`, with `ContextMenuTrigger` (the right-click area) and no CreateHandle.
- **Shape:** `ContextMenu > ContextMenuTrigger > row`, then `ContextMenuPopup > ContextMenuItem*`.
- **Props:** same as menu.
- **Style:** Base UI ContextMenu.

## popover
- **Exports:** `Popover`, `PopoverTrigger`, `PopoverPopup` (alias `PopoverContent`), `PopoverTitle`, `PopoverDescription`, `PopoverClose`, `PopoverCreateHandle`.
- **Shape:** `Popover > PopoverTrigger render={<Button/>}`, then `PopoverPopup > PopoverTitle + PopoverDescription + content`.
- **Props:** `PopoverPopup` takes `side`, `align`, `sideOffset` and `tooltipStyle` (compact dark look). `Popover` takes `open` and `onOpenChange`.
- **Style:** Base UI.
- **Caveats:** use it for filter panels.

## checkbox
- **Exports:** `Checkbox`, `CheckboxPrimitive`.
- **Props:** `checked`, `defaultChecked`, `onCheckedChange`, `indeterminate`, `disabled`.
- **Style:** Base UI.
- **Caveats:**
  - `indeterminate` is the header-row select-all.
  - The `checkbox-group` subpath exports `CheckboxGroup`, which takes `value: string[]` and supports `allValues` for parent selection.

## switch
- **Exports:** `Switch`, `SwitchPrimitive`.
- **Props:** `checked`, `onCheckedChange`, `disabled`.
- **Style:** Base UI.
- **Caveats:** no size variant.

## chat
- **Exports:**
  - `ChatConversation`, `ChatMessage`, `ChatMessageLayout`, `ChatMessageAvatar`, `ChatMessageHeader`, `ChatMessageContent`, `ChatMessageFooter`, `ChatMessageBubble`, `ChatBubble`, `ChatBubbleReactions`, `ChatMessageText`, `ChatCollapsibleMessage`, `ChatMessageInfo`, `ChatMessageActionToolbar`.
  - `ChatReactionChip`, `ChatReactionPicker`, `ChatReplyPreview`, `ChatReplyReference`, `ChatDatePill`, `ChatUnreadDivider`, `ChatTypingIndicator`, `ChatDeliveryIndicator`, `ChatJumpToLatestButton`.
  - `ChatMemberList`, `ChatMemberSection`, `ChatEmptyState`, `ChatLoadingState`, `ChatStatusBar`.
  - Hooks and helpers: `useChatScroll`, `useChatPopupDismissal`, `splitChatMessagePreview`.
- **Shape:** `ChatConversation > (ChatDatePill | ChatUnreadDivider | ChatMessage > ChatMessageLayout > ChatMessageAvatar + ChatMessageContent > ChatMessageHeader + ChatMessageBubble + ChatMessageFooter)*`, then `ChatTypingIndicator`.
- **Style:** custom (not Base UI).
- **Caveats:**
  - No story exists; read `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/src/components/chat/*.tsx` for props.
  - Relevant for thread or case conversation views, not lists.

## composer
- **Exports:** `Composer`, `ComposerInput`, `ComposerToken`, `ComposerPopup`, `ComposerList`, `ComposerItem`, `ComposerStatus`, `ComposerActions`, `ComposerActionGroup`, `ComposerSubmit`, `useComposerContext`, `useComposerFilter`, `getComposerText`, plus types (`ComposerValue`, `ComposerTrigger`, `ComposerPart`, ...).
- **Shape:** `Composer > ComposerInput` (contenteditable with @/# trigger tokens), then `ComposerPopup > ComposerList > ComposerItem`, then `ComposerActions > ComposerActionGroup + ComposerSubmit`.
- **Style:** custom editor plus a Base UI Popover.
- **Caveats:**
  - Plain text with mention/trigger tokens; no formatting. It is not a rich-text editor.
  - The hook `useComposerEditor` lives in `src/hooks/use-composer-editor.ts` but is not exported from `./hooks`.

## stepper
- **Exports:** `Stepper`, `StepperItem`, `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription`, `StepperSeparator`.
- **Shape:** `Stepper > StepperItem step > StepperTrigger > StepperIndicator + StepperTitle + StepperDescription`, with `StepperSeparator` between items.
- **Props:**
  - `Stepper` takes `value`, `defaultValue`, `onValueChange` and `orientation`.
  - `StepperItem` takes `step` (required), `completed`, `disabled` and `loading`.
  - `StepperIndicator` takes `asChild`.
- **Style:** origin-ui style.
- **Caveats:** use it for workflow or status pipelines (for example case stage).

## tree
- **Exports:** `Tree`, `TreeItem`, `TreeItemLabel`, `TreeDragLine`.
- **Shape:** `Tree tree={headlessTree} indent > tree.getItems().map(item => <TreeItem item={item}><TreeItemLabel/></TreeItem>)`.
- **Props:** `Tree` takes `indent` (default 20) and `tree` (a headless-tree instance). `TreeItem` takes `item: ItemInstance` (required).
- **Style:** a skin over `@headless-tree/core`.
- **Caveats:**
  - Requires a `@headless-tree/core` (and `/react`) `useTree` instance. That is an optional peer and is not in the playground.
  - The story is only a placeholder.
  - Avoid it for mocks, or hand-roll nested lists.

## number-ticker
- **Exports:** `NumberTicker`.
- **Props:** `value` (required), `startValue`, `direction: up | down`, `delay` (seconds), `decimalPlaces`, plus span props.
- **Style:** a `motion/react` spring.
- **Caveats:** animates on view. Use it for KPI numbers. Format the units around it, because it formats with locale grouping only.

## alert
- **Exports:** `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`, primitives.
- **Shape:** `Alert variant > icon + AlertTitle + AlertDescription + AlertAction`.
- **Props:** `variant: default | info | success | warning | error`.
- **Style:** coss.

## field
- **Exports:** `Field`, `FieldLabel`, `FieldItem`, `FieldDescription`, `FieldError`, `FieldControl`, `FieldValidity`, primitives.
- **Shape:** `Field name > FieldLabel + Input/Select + FieldDescription + FieldError`. `FieldItem` wraps checkbox or radio rows.
- **Props:** `Field` takes `invalid`, `disabled` and `name` (Base UI). `FieldError` takes `match`.
- **Style:** Base UI Field.
- **Related:** `fieldset` (`Fieldset`, `FieldsetLegend`), `form` (`Form`), `label` (`Label`), `form-root-error`.

## resizable
- **Exports:** `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`.
- **Shape:** `ResizablePanelGroup direction="horizontal" > ResizablePanel defaultSize + ResizableHandle withHandle + ResizablePanel`.
- **Props:** react-resizable-panels v3 props (`direction`, `defaultSize`, `minSize`, `collapsible`). `ResizableHandle` takes `withHandle`.
- **Style:** shadcn wrapper.
- **Caveats:** optional peer, not in the playground. This is the list+detail split pane.

## accordion
- **Exports:** `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionPanel` (alias `AccordionContent`), primitives.
- **Shape:** `Accordion > AccordionItem value > AccordionTrigger + AccordionPanel`.
- **Props:** `value: any[]`, `defaultValue`, `onValueChange`, `openMultiple` (Base UI).
- **Style:** Base UI.

## collapsible
- **Exports:** `Collapsible`, `CollapsibleTrigger`, `CollapsiblePanel` (alias `CollapsibleContent`).
- **Shape:** `Collapsible > CollapsibleTrigger + CollapsiblePanel`.
- **Props:** `open`, `defaultOpen`, `onOpenChange`.
- **Style:** Base UI.

## group
- **Exports:** `Group` (alias `ButtonGroup`), `GroupText` (alias `ButtonGroupText`), `GroupSeparator` (alias `ButtonGroupSeparator`), `GroupPrimitive`, `GroupTextPrimitive`.
- **Shape:** `Group > Button + GroupSeparator + Button | GroupText | Input`.
- **Props:** `orientation: horizontal | vertical`.
- **Style:** coss.
- **Caveats:** fuses adjacent controls (split button, segmented actions).

## preview-card
- **Exports:** `PreviewCard` (alias `HoverCard`), `PreviewCardTrigger` (alias `HoverCardTrigger`), `PreviewCardPopup` (alias `HoverCardContent`).
- **Shape:** `PreviewCard > PreviewCardTrigger render={<a/>}`, then `PreviewCardPopup`.
- **Props:** `PreviewCardPopup` takes `side`, `align`, `sideOffset` and `anchor`.
- **Style:** Base UI.
- **Caveats:** use it for hovering an entity reference in a list cell.

## spinner
- **Exports:** `Spinner`.
- **Props:** lucide `Loader2Icon` props. Size it with `className`.

## textarea
- **Exports:** `Textarea`, `TextareaPrimitive`, `TextareaSize`.
- **Props:** `size: sm | default | lg`, `unstyled`.
- **Style:** Base UI Field.Control.

## toast
- **Exports:** `ToastProvider`, `toastManager`, `AnchoredToastProvider`, `anchoredToastManager`, `ToastPosition`, `ToastData`.
- **Shape:** wrap the app (or the recipe root) in `<ToastProvider position>`, then call `toastManager.add({title, description, type, actionProps, timeout, data})` imperatively.
- **Props:**
  - `ToastProvider` takes `position`: `top-left | top-center | top-right | bottom-left | bottom-center | bottom-right` (default `bottom-right`), plus `portalProps`.
  - `type`: `success | error | warning | info | loading`.
  - `toastManager.promise` is available.
- **Style:** Base UI Toast.
- **Caveats:**
  - Requires the provider.
  - The managers are module singletons.
  - The anchored variant is for toasts tied to an element.

## currency-input
- **Exports:** `CurrencyInput`.
- **Props:** `currency` (ISO 4217, default USD), `format` (Intl options), `inputProps`, plus NumberField props (`value: number | null`, `onValueChange`, `min`, `max`). `step` defaults to `"any"`.
- **Style:** wraps `NumberField > NumberFieldGroup > NumberFieldInput`.

## number-field
- **Exports:** `NumberField`, `NumberFieldGroup`, `NumberFieldDecrement`, `NumberFieldInput`, `NumberFieldIncrement`, `NumberFieldScrubArea`.
- **Shape:** `NumberField > NumberFieldScrubArea?`, then `NumberFieldGroup > NumberFieldDecrement + NumberFieldInput + NumberFieldIncrement`.
- **Props:** `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`, `format`.
- **Style:** Base UI NumberField.

## carousel
- **Exports:** `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `type CarouselApi`.
- **Shape:** `Carousel opts > CarouselContent > CarouselItem*`, then `CarouselPrevious` and `CarouselNext`.
- **Props:** `opts` (embla), `orientation`, `setApi`, `plugins`.
- **Style:** shadcn wrapper over embla.
- **Caveats:** optional peer, not in the playground.

## slider
- **Exports:** `Slider`, `SliderValue`, `SliderPrimitive`.
- **Props:** `value: number | number[]` (an array makes it a range), `onValueChange`, `min`, `max`, `step`, `orientation`.
- **Style:** Base UI Slider.
- **Caveats:** the thumb and track render automatically. Useful for range filters.

## aspect-ratio
- **Exports:** `AspectRatio`.
- **Props:** `ratio` (number), `render`.
- **Style:** `useRender` div.

## Other subpaths not in the requested list
- `sidebar`: `SidebarProvider` (required), `Sidebar`, `SidebarInset`, `SidebarMenu*`, `SidebarMenuBadge`, `useSidebar`. The recipe already uses it.
- `radio-group`: `RadioGroup` and `Radio`.
- `otp-field`.
- `spinning-text`.

## hooks (`@tilli.dev/ui-atoms/hooks`)
- `useCopyToClipboard({timeout = 2000, onCopy}) -> {copyToClipboard(value), isCopied}`
- `useMediaQuery(query: BreakpointQuery | {min?, max?, pointer?: "coarse" | "fine"} | string): boolean`. Breakpoint strings look like `"max-md"`. It is SSR-safe through `useSyncExternalStore`.
- `useIsMobile(): boolean`, which is `useMediaQuery("max-md")`.
- `type MediaQueryInput`.
- Not exported from hooks: `use-composer-editor.ts`. Composer re-exports its pieces.

## formatters (`@tilli.dev/ui-atoms/formatters`)
- `formatArktypeValidationMessage(message: string): string` turns an arktype camelCase key message into a sentence-case label.
- `getCurrencySymbol(locale = "en-US", currency = "USD"): string`.
- There are no date, number, relative-time or compact-number formatters. Use `Intl` directly in the recipe.

## utils (`@tilli.dev/ui-atoms/utils`)
- `cn(...inputs: ClassValue[]): string`.

## Files
- `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/package.json` (exports map, optional peers)
- `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/src/components/<subpath>/index.tsx`
- `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/src/hooks/index.ts`
- `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/src/formatters.ts`
- `/Users/g1n/tilli/ui-atoms/packages/ui-atoms/src/utils.ts`
- `/Users/g1n/tilli/ui-atoms/apps/storybook/src/stories/<subpath>.stories.tsx`
- `/Users/g1n/tilli/ui-atoms/apps/playground/package.json` (lacks the four optional peers)
