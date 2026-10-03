import type * as React from "react";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/frame.tsx` @8163481, merged selectively. The base wins
// everywhere except the one tilli lead we must not lose: `FramePanel`'s
// `not-has-[table]:` variants, which let a panel wrap a bare `<table>` without
// double-framing it. coss has no table-aware panel, so a wholesale take would
// delete them. Every value inside those guards is the base's
// (`bg-background`, `shadow-xs/5`, the `white/6%` dark inset).

const frameVariants = cva({
  base: "relative flex flex-col rounded-2xl bg-muted/72 p-1 *:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1",
});

const framePanelVariants = cva({
  base: "relative not-has-[table]:rounded-xl not-has-[table]:border not-has-[table]:bg-background bg-clip-padding not-has-[table]:p-5 not-has-[table]:shadow-xs/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] has-[table]:before:hidden dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

const frameHeaderVariants = cva({ base: "flex flex-col px-5 py-4" });
const frameTitleVariants = cva({ base: "font-semibold text-sm" });
const frameDescriptionVariants = cva({ base: "text-muted-foreground text-sm" });
const frameFooterVariants = cva({ base: "px-5 py-4" });

export type FramePrimitiveProps = React.ComponentProps<"div">;

function FramePrimitive(props: FramePrimitiveProps) {
  return <div data-slot="frame" {...props} />;
}

export type FrameProps = FramePrimitiveProps;

function Frame({ className, ...props }: FrameProps) {
  return (
    <FramePrimitive className={cn(frameVariants(), className)} {...props} />
  );
}

export type FramePanelPrimitiveProps = React.ComponentProps<"div">;

function FramePanelPrimitive(props: FramePanelPrimitiveProps) {
  return <div data-slot="frame-panel" {...props} />;
}

export type FramePanelProps = FramePanelPrimitiveProps;

function FramePanel({ className, ...props }: FramePanelProps) {
  return (
    <FramePanelPrimitive
      className={cn(framePanelVariants(), className)}
      {...props}
    />
  );
}

export type FrameHeaderPrimitiveProps = React.ComponentProps<"header">;

function FrameHeaderPrimitive(props: FrameHeaderPrimitiveProps) {
  return <header data-slot="frame-panel-header" {...props} />;
}

export type FrameHeaderProps = FrameHeaderPrimitiveProps;

function FrameHeader({ className, ...props }: FrameHeaderProps) {
  return (
    <FrameHeaderPrimitive
      className={cn(frameHeaderVariants(), className)}
      {...props}
    />
  );
}

export type FrameTitlePrimitiveProps = React.ComponentProps<"div">;

function FrameTitlePrimitive(props: FrameTitlePrimitiveProps) {
  return <div data-slot="frame-panel-title" {...props} />;
}

export type FrameTitleProps = FrameTitlePrimitiveProps;

function FrameTitle({ className, ...props }: FrameTitleProps) {
  return (
    <FrameTitlePrimitive
      className={cn(frameTitleVariants(), className)}
      {...props}
    />
  );
}

export type FrameDescriptionPrimitiveProps = React.ComponentProps<"div">;

function FrameDescriptionPrimitive(props: FrameDescriptionPrimitiveProps) {
  return <div data-slot="frame-panel-description" {...props} />;
}

export type FrameDescriptionProps = FrameDescriptionPrimitiveProps;

function FrameDescription({ className, ...props }: FrameDescriptionProps) {
  return (
    <FrameDescriptionPrimitive
      className={cn(frameDescriptionVariants(), className)}
      {...props}
    />
  );
}

export type FrameFooterPrimitiveProps = React.ComponentProps<"footer">;

function FrameFooterPrimitive(props: FrameFooterPrimitiveProps) {
  return <footer data-slot="frame-panel-footer" {...props} />;
}

export type FrameFooterProps = FrameFooterPrimitiveProps;

function FrameFooter({ className, ...props }: FrameFooterProps) {
  return (
    <FrameFooterPrimitive
      className={cn(frameFooterVariants(), className)}
      {...props}
    />
  );
}

export {
  Frame,
  FrameDescription,
  FrameDescriptionPrimitive,
  FrameFooter,
  FrameFooterPrimitive,
  FrameHeader,
  FrameHeaderPrimitive,
  FramePanel,
  FramePanelPrimitive,
  FramePrimitive,
  FrameTitle,
  FrameTitlePrimitive,
  frameDescriptionVariants,
  frameFooterVariants,
  frameHeaderVariants,
  framePanelVariants,
  frameTitleVariants,
  frameVariants,
};
