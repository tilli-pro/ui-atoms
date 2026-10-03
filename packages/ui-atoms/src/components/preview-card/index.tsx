import { PreviewCard as BaseUIPreviewCard } from "@base-ui/react/preview-card";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/preview-card.tsx` @8163481, taken wholesale.

const previewCardPopupVariants = cva({
  base: "relative flex w-64 origin-(--transform-origin) text-balance rounded-lg border bg-popover not-dark:bg-clip-padding p-4 text-popover-foreground text-sm shadow-lg/5 transition-[scale,opacity] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const PreviewCard = BaseUIPreviewCard.Root;

export type PreviewCardTriggerProps = BaseUIPreviewCard.Trigger.Props;

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
  return (
    <BaseUIPreviewCard.Trigger data-slot="preview-card-trigger" {...props} />
  );
}

export interface PreviewCardPopupPrimitiveProps
  extends BaseUIPreviewCard.Popup.Props {
  align?: BaseUIPreviewCard.Positioner.Props["align"];
  anchor?: BaseUIPreviewCard.Positioner.Props["anchor"];
  portalProps?: BaseUIPreviewCard.Portal.Props;
  sideOffset?: BaseUIPreviewCard.Positioner.Props["sideOffset"];
}

function PreviewCardPopupPrimitive({
  align = "center",
  anchor,
  children,
  portalProps,
  sideOffset = 4,
  ...props
}: PreviewCardPopupPrimitiveProps) {
  return (
    <BaseUIPreviewCard.Portal {...portalProps}>
      <BaseUIPreviewCard.Positioner
        align={align}
        anchor={anchor}
        className="z-50"
        data-slot="preview-card-positioner"
        sideOffset={sideOffset}
      >
        <BaseUIPreviewCard.Popup data-slot="preview-card-content" {...props}>
          {children}
        </BaseUIPreviewCard.Popup>
      </BaseUIPreviewCard.Positioner>
    </BaseUIPreviewCard.Portal>
  );
}

export type PreviewCardPopupProps = PreviewCardPopupPrimitiveProps;

function PreviewCardPopup({ className, ...props }: PreviewCardPopupProps) {
  return (
    <PreviewCardPopupPrimitive
      className={cn(previewCardPopupVariants(), className)}
      {...props}
    />
  );
}

export {
  PreviewCard,
  // The base ships these aliases itself, so the retirement of shadcn aliases
  // does not reach them (same exception as `CardContent`).
  PreviewCard as HoverCard,
  PreviewCardPopup,
  PreviewCardPopup as HoverCardContent,
  PreviewCardPopupPrimitive,
  PreviewCardTrigger,
  PreviewCardTrigger as HoverCardTrigger,
  previewCardPopupVariants,
};
