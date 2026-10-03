import type * as React from "react";
import { Dialog as BaseUIDialog } from "@base-ui/react/dialog";
import { cva } from "cva";
import { SearchIcon } from "lucide-react";
import { cn } from "../../utils.js";
import {
  Autocomplete,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from "../autocomplete/index.js";

// CMD-2, swap 3 of 4: cmdk → coss's Base UI Autocomplete command. coss base
// `.coss-base/command.tsx` @8163481.
//
// Breaking surface for consumers migrating from the earlier component: the `[cmdk-*]` selector
// vocabulary and the item's `data-selected="true"` / `aria-selected` are
// replaced by `data-slot="command-*"` and Base UI's `data-highlighted` (the
// highlight attribute lives on the Autocomplete item, not here);
// `CommandDialog` inverts — ours wrapped a Command in a dialog, this one *is*
// the dialog root — and `items` plus a render-function child replace cmdk's
// implicit child scanning. `multi-select` goes with cmdk (MSL-1), and CMD-1's
// build error over the missing dialog parts disappears with the old file.

const commandDialogBackdropVariants = cva({
  base: "fixed inset-0 z-50 bg-black/32 backdrop-blur-sm transition-all duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0",
});

const commandDialogViewportVariants = cva({
  base: "fixed inset-0 z-50 flex flex-col items-center px-4 py-[max(--spacing(4),4vh)] sm:py-[10vh]",
});

const commandDialogPopupVariants = cva({
  base: "relative row-start-2 flex max-h-105 min-h-0 w-full min-w-0 max-w-xl -translate-y-[calc(1.25rem*var(--nested-dialogs))] scale-[calc(1-0.1*var(--nested-dialogs))] flex-col rounded-2xl border bg-popover not-dark:bg-clip-padding text-popover-foreground opacity-[calc(1-0.1*var(--nested-dialogs))] shadow-lg/5 outline-none transition-[scale,opacity,translate] duration-200 ease-in-out will-change-transform before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] data-nested:data-ending-style:translate-y-8 data-nested:data-starting-style:translate-y-8 data-nested-dialog-open:origin-top data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 **:data-[slot=scroll-area-viewport]:data-has-overflow-y:pe-1 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const commandInputFrameVariants = cva({ base: "px-2.5 py-1.5" });

const commandInputVariants = cva({
  base: "border-transparent! bg-transparent! shadow-none before:hidden has-focus-visible:ring-0",
});

const commandListVariants = cva({
  base: "not-empty:scroll-py-2 not-empty:p-2",
});

const commandEmptyVariants = cva({ base: "not-empty:py-6" });

const commandPanelVariants = cva({
  base: "relative -mx-px not-has-[+[data-slot=command-footer]]:-mb-px min-h-0 rounded-t-xl not-has-[+[data-slot=command-footer]]:rounded-b-2xl border border-b-0 bg-popover bg-clip-padding shadow-xs/5 [clip-path:inset(0_1px)] not-has-[+[data-slot=command-footer]]:[clip-path:inset(0_1px_1px_1px_round_0_0_calc(var(--radius-2xl)-1px)_calc(var(--radius-2xl)-1px))] before:pointer-events-none before:absolute before:inset-0 before:rounded-t-[calc(var(--radius-xl)-1px)] **:data-[slot=scroll-area-scrollbar]:mt-2",
});

const commandItemVariants = cva({ base: "py-1.5" });

const commandSeparatorVariants = cva({ base: "my-2" });

const commandShortcutVariants = cva({
  base: "ms-auto font-medium font-sans text-muted-foreground/72 text-xs tracking-widest",
});

const commandFooterVariants = cva({
  base: "flex items-center justify-between gap-2 rounded-b-[calc(var(--radius-2xl)-1px)] border-t px-5 py-3 text-muted-foreground text-xs",
});

const CommandDialog = BaseUIDialog.Root;
const CommandDialogPortal = BaseUIDialog.Portal;
const CommandCreateHandle = BaseUIDialog.createHandle;
const CommandCollection = AutocompleteCollection;

export type CommandDialogTriggerProps = BaseUIDialog.Trigger.Props;

function CommandDialogTrigger(props: CommandDialogTriggerProps) {
  return <BaseUIDialog.Trigger data-slot="command-dialog-trigger" {...props} />;
}

export type CommandDialogBackdropPrimitiveProps = BaseUIDialog.Backdrop.Props;

function CommandDialogBackdropPrimitive(
  props: CommandDialogBackdropPrimitiveProps,
) {
  return (
    <BaseUIDialog.Backdrop data-slot="command-dialog-backdrop" {...props} />
  );
}

export type CommandDialogBackdropProps = CommandDialogBackdropPrimitiveProps;

function CommandDialogBackdrop({
  className,
  ...props
}: CommandDialogBackdropProps) {
  return (
    <CommandDialogBackdropPrimitive
      className={cn(commandDialogBackdropVariants(), className)}
      {...props}
    />
  );
}

export type CommandDialogViewportPrimitiveProps = BaseUIDialog.Viewport.Props;

function CommandDialogViewportPrimitive(
  props: CommandDialogViewportPrimitiveProps,
) {
  return (
    <BaseUIDialog.Viewport data-slot="command-dialog-viewport" {...props} />
  );
}

export type CommandDialogViewportProps = CommandDialogViewportPrimitiveProps;

function CommandDialogViewport({
  className,
  ...props
}: CommandDialogViewportProps) {
  return (
    <CommandDialogViewportPrimitive
      className={cn(commandDialogViewportVariants(), className)}
      {...props}
    />
  );
}

export interface CommandDialogPopupPrimitiveProps
  extends BaseUIDialog.Popup.Props {
  portalProps?: BaseUIDialog.Portal.Props;
}

function CommandDialogPopupPrimitive({
  portalProps,
  ...props
}: CommandDialogPopupPrimitiveProps) {
  return (
    <CommandDialogPortal {...portalProps}>
      <CommandDialogBackdrop />
      <CommandDialogViewport>
        <BaseUIDialog.Popup data-slot="command-dialog-popup" {...props} />
      </CommandDialogViewport>
    </CommandDialogPortal>
  );
}

export type CommandDialogPopupProps = CommandDialogPopupPrimitiveProps;

function CommandDialogPopup({ className, ...props }: CommandDialogPopupProps) {
  return (
    <CommandDialogPopupPrimitive
      className={cn(commandDialogPopupVariants(), className)}
      {...props}
    />
  );
}

export type CommandProps = React.ComponentProps<typeof Autocomplete>;

/** An always-open, inline, always-highlighting Autocomplete. */
function Command({
  autoHighlight = "always",
  keepHighlight = true,
  ...props
}: CommandProps) {
  return (
    <Autocomplete
      autoHighlight={autoHighlight}
      inline={true}
      keepHighlight={keepHighlight}
      open={true}
      {...props}
    />
  );
}

export type CommandInputProps = React.ComponentProps<typeof AutocompleteInput>;

function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div className={commandInputFrameVariants()}>
      <AutocompleteInput
        autoFocus={true}
        className={cn(commandInputVariants(), className)}
        size="lg"
        startAddon={<SearchIcon />}
        {...props}
      />
    </div>
  );
}

export type CommandListProps = React.ComponentProps<typeof AutocompleteList>;

function CommandList({ className, ...props }: CommandListProps) {
  return (
    <AutocompleteList
      className={cn(commandListVariants(), className)}
      data-slot="command-list"
      {...props}
    />
  );
}

export type CommandEmptyProps = React.ComponentProps<typeof AutocompleteEmpty>;

function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <AutocompleteEmpty
      className={cn(commandEmptyVariants(), className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

export type CommandPanelProps = React.ComponentProps<"div">;

function CommandPanel({ className, ...props }: CommandPanelProps) {
  return <div className={cn(commandPanelVariants(), className)} {...props} />;
}

export type CommandGroupProps = React.ComponentProps<typeof AutocompleteGroup>;

function CommandGroup(props: CommandGroupProps) {
  return <AutocompleteGroup data-slot="command-group" {...props} />;
}

export type CommandGroupLabelProps = React.ComponentProps<
  typeof AutocompleteGroupLabel
>;

function CommandGroupLabel(props: CommandGroupLabelProps) {
  return <AutocompleteGroupLabel data-slot="command-group-label" {...props} />;
}

export type CommandItemProps = React.ComponentProps<typeof AutocompleteItem>;

function CommandItem({ className, ...props }: CommandItemProps) {
  return (
    <AutocompleteItem
      className={cn(commandItemVariants(), className)}
      data-slot="command-item"
      {...props}
    />
  );
}

export type CommandSeparatorProps = React.ComponentProps<
  typeof AutocompleteSeparator
>;

function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <AutocompleteSeparator
      className={cn(commandSeparatorVariants(), className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

export type CommandShortcutProps = React.ComponentProps<"kbd">;

function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <kbd
      className={cn(commandShortcutVariants(), className)}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

export type CommandFooterProps = React.ComponentProps<"div">;

function CommandFooter({ className, ...props }: CommandFooterProps) {
  return (
    <div
      className={cn(commandFooterVariants(), className)}
      data-slot="command-footer"
      {...props}
    />
  );
}

export {
  Command,
  CommandCollection,
  CommandCreateHandle,
  CommandDialog,
  CommandDialogBackdrop,
  CommandDialogBackdropPrimitive,
  CommandDialogPopup,
  CommandDialogPopupPrimitive,
  CommandDialogPortal,
  CommandDialogTrigger,
  CommandDialogViewport,
  CommandDialogViewportPrimitive,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
  commandDialogBackdropVariants,
  commandDialogPopupVariants,
  commandDialogViewportVariants,
  commandEmptyVariants,
  commandFooterVariants,
  commandInputFrameVariants,
  commandInputVariants,
  commandItemVariants,
  commandListVariants,
  commandPanelVariants,
  commandSeparatorVariants,
  commandShortcutVariants,
};
