import type * as React from "react";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/empty.tsx` @8163481. No divergence id and no tilli lead
// touches this component, and `empty` is not one of the fourteen the size-ramp
// hold-back names, so every class string is the base's verbatim.

const emptyVariants = cva({
  base: "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance px-6 py-12 text-center md:py-20",
});

const emptyHeaderVariants = cva({
  base: "flex max-w-sm flex-col items-center text-center",
});

const emptyMediaFrameVariants = cva({ base: "relative mb-6" });

const emptyMediaVariants = cva({
  base: "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "relative flex size-9 shrink-0 items-center justify-center rounded-md border bg-card not-dark:bg-clip-padding text-foreground shadow-sm/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-md)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)] [&_svg:not([class*='size-'])]:size-4.5",
    },
  },
});

const emptyTitleVariants = cva({
  base: "font-heading font-semibold text-xl",
});

const emptyDescriptionVariants = cva({
  base: "text-muted-foreground text-sm [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4 [[data-slot=empty-title]+&]:mt-1",
});

const emptyContentVariants = cva({
  base: "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
});

export type EmptyPrimitiveProps = React.ComponentProps<"div">;

function EmptyPrimitive(props: EmptyPrimitiveProps) {
  return <div data-slot="empty" {...props} />;
}

export type EmptyProps = EmptyPrimitiveProps;

function Empty({ className, ...props }: EmptyProps) {
  return (
    <EmptyPrimitive className={cn(emptyVariants(), className)} {...props} />
  );
}

export type EmptyHeaderPrimitiveProps = React.ComponentProps<"div">;

function EmptyHeaderPrimitive(props: EmptyHeaderPrimitiveProps) {
  return <div data-slot="empty-header" {...props} />;
}

export type EmptyHeaderProps = EmptyHeaderPrimitiveProps;

function EmptyHeader({ className, ...props }: EmptyHeaderProps) {
  return (
    <EmptyHeaderPrimitive
      className={cn(emptyHeaderVariants(), className)}
      {...props}
    />
  );
}

export interface EmptyMediaPrimitiveProps extends React.ComponentProps<"div"> {
  variant?: VariantProps<typeof emptyMediaVariants>["variant"];
}

interface EmptyMediaPrimitiveInternalProps extends EmptyMediaPrimitiveProps {
  /** Internal channel for the media tile's class set. */
  mediaClassName?: string;
}

/**
 * The `icon` variant stacks two aria-hidden copies of the tile behind the real
 * one to fake a small pile of cards; that structure is behaviour, not theme.
 */
function EmptyMediaPrimitive({
  className,
  mediaClassName,
  variant = "default",
  ...props
}: EmptyMediaPrimitiveInternalProps) {
  return (
    <div className={className} data-slot="empty-media" data-variant={variant}>
      {variant === "icon" && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              mediaClassName,
              "pointer-events-none absolute bottom-px origin-bottom-left -translate-x-0.5 -rotate-10 scale-84 shadow-none",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              mediaClassName,
              "pointer-events-none absolute bottom-px origin-bottom-right translate-x-0.5 rotate-10 scale-84 shadow-none",
            )}
          />
        </>
      )}
      <div className={mediaClassName} {...props} />
    </div>
  );
}

export type EmptyMediaProps = EmptyMediaPrimitiveProps;

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: EmptyMediaProps) {
  return (
    <EmptyMediaPrimitive
      className={cn(emptyMediaFrameVariants(), className)}
      mediaClassName={cn(emptyMediaVariants({ className, variant }))}
      variant={variant}
      {...props}
    />
  );
}

export type EmptyTitlePrimitiveProps = React.ComponentProps<"div">;

function EmptyTitlePrimitive(props: EmptyTitlePrimitiveProps) {
  return <div data-slot="empty-title" {...props} />;
}

export type EmptyTitleProps = EmptyTitlePrimitiveProps;

function EmptyTitle({ className, ...props }: EmptyTitleProps) {
  return (
    <EmptyTitlePrimitive
      className={cn(emptyTitleVariants(), className)}
      {...props}
    />
  );
}

export type EmptyDescriptionPrimitiveProps = React.ComponentProps<"div">;

function EmptyDescriptionPrimitive(props: EmptyDescriptionPrimitiveProps) {
  return <div data-slot="empty-description" {...props} />;
}

export type EmptyDescriptionProps = EmptyDescriptionPrimitiveProps;

function EmptyDescription({ className, ...props }: EmptyDescriptionProps) {
  return (
    <EmptyDescriptionPrimitive
      className={cn(emptyDescriptionVariants(), className)}
      {...props}
    />
  );
}

export type EmptyContentPrimitiveProps = React.ComponentProps<"div">;

function EmptyContentPrimitive(props: EmptyContentPrimitiveProps) {
  return <div data-slot="empty-content" {...props} />;
}

export type EmptyContentProps = EmptyContentPrimitiveProps;

function EmptyContent({ className, ...props }: EmptyContentProps) {
  return (
    <EmptyContentPrimitive
      className={cn(emptyContentVariants(), className)}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyContent,
  EmptyContentPrimitive,
  EmptyDescription,
  EmptyDescriptionPrimitive,
  EmptyHeader,
  EmptyHeaderPrimitive,
  EmptyMedia,
  EmptyMediaPrimitive,
  EmptyPrimitive,
  EmptyTitle,
  EmptyTitlePrimitive,
  emptyContentVariants,
  emptyDescriptionVariants,
  emptyHeaderVariants,
  emptyMediaFrameVariants,
  emptyMediaVariants,
  emptyTitleVariants,
  emptyVariants,
};
