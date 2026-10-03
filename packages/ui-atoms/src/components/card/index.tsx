"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "cva";
import { cn } from "../../utils.js";

// Every part below is the same styled/primitive/variants triple over the coss base: an unstyled
// `<Part>Primitive` that only carries the `data-slot`, the base's class string
// as `<part>Variants`, and the styled `<Part>`. The `as …PrimitiveProps`
// assertion on each defaults object is needed because `data-slot` is a valid
// DOM attribute but not a member of React's prop types, and an object literal
// with no other key fails TypeScript's weak-type check.

export type CardPrimitiveProps = useRender.ComponentProps<"div">;

function CardPrimitive({ render, ...props }: CardPrimitiveProps) {
  const defaultProps = { "data-slot": "card" } as CardPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardVariants = cva({
  base: "relative flex flex-col rounded-2xl border bg-card not-dark:bg-clip-padding text-card-foreground shadow-xs/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]",
});

export type CardProps = CardPrimitiveProps;

function Card({ className, ...props }: CardProps) {
  return <CardPrimitive className={cn(cardVariants(), className)} {...props} />;
}

export type CardFramePrimitiveProps = useRender.ComponentProps<"div">;

function CardFramePrimitive({ render, ...props }: CardFramePrimitiveProps) {
  const defaultProps = { "data-slot": "card-frame" } as CardFramePrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameVariants = cva({
  base: "relative flex flex-col rounded-2xl border bg-card not-dark:bg-clip-padding text-card-foreground shadow-xs/5 [--clip-bottom:-1rem] [--clip-top:-1rem] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:bg-muted/72 before:shadow-[0_1px_--theme(--color-black/4%)] has-data-[slot=table-container]:overflow-hidden *:data-[slot=card]:-m-px *:data-[slot=table-container]:-m-px *:data-[slot=table-container]:w-[calc(100%+2px)] *:not-first:data-[slot=card]:rounded-t-xl *:not-last:data-[slot=card]:rounded-b-xl *:data-[slot=card]:bg-clip-padding *:data-[slot=card]:shadow-none *:data-[slot=card]:before:hidden *:not-first:data-[slot=card]:before:rounded-t-[calc(var(--radius-xl)-1px)] *:not-last:data-[slot=card]:before:rounded-b-[calc(var(--radius-xl)-1px)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)] *:data-[slot=card]:[clip-path:inset(var(--clip-top)_1px_var(--clip-bottom)_1px_round_calc(var(--radius-2xl)-1px))] *:data-[slot=card]:last:[--clip-bottom:1px] *:data-[slot=card]:first:[--clip-top:1px]",
});

export type CardFrameProps = CardFramePrimitiveProps;

function CardFrame({ className, ...props }: CardFrameProps) {
  return (
    <CardFramePrimitive
      className={cn(cardFrameVariants(), className)}
      {...props}
    />
  );
}

export type CardFrameHeaderPrimitiveProps = useRender.ComponentProps<"div">;

function CardFrameHeaderPrimitive({
  render,
  ...props
}: CardFrameHeaderPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-frame-header",
  } as CardFrameHeaderPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameHeaderVariants = cva({
  // The base opens this string with `flex grid …`; `grid` wins and the `flex`
  // is dead, so it is dropped rather than copied.
  base: "relative grid auto-rows-min grid-rows-[auto_auto] flex-col items-start gap-x-4 px-6 py-4 has-data-[slot=card-frame-action]:grid-cols-[1fr_auto]",
});

export type CardFrameHeaderProps = CardFrameHeaderPrimitiveProps;

function CardFrameHeader({ className, ...props }: CardFrameHeaderProps) {
  return (
    <CardFrameHeaderPrimitive
      className={cn(cardFrameHeaderVariants(), className)}
      {...props}
    />
  );
}

export type CardFrameTitlePrimitiveProps = useRender.ComponentProps<"div">;

function CardFrameTitlePrimitive({
  render,
  ...props
}: CardFrameTitlePrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-frame-title",
  } as CardFrameTitlePrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameTitleVariants = cva({
  base: "self-center font-semibold text-sm",
});

export type CardFrameTitleProps = CardFrameTitlePrimitiveProps;

function CardFrameTitle({ className, ...props }: CardFrameTitleProps) {
  return (
    <CardFrameTitlePrimitive
      className={cn(cardFrameTitleVariants(), className)}
      {...props}
    />
  );
}

export type CardFrameDescriptionPrimitiveProps =
  useRender.ComponentProps<"div">;

function CardFrameDescriptionPrimitive({
  render,
  ...props
}: CardFrameDescriptionPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-frame-description",
  } as CardFrameDescriptionPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameDescriptionVariants = cva({
  base: "self-center text-muted-foreground text-sm",
});

export type CardFrameDescriptionProps = CardFrameDescriptionPrimitiveProps;

function CardFrameDescription({
  className,
  ...props
}: CardFrameDescriptionProps) {
  return (
    <CardFrameDescriptionPrimitive
      className={cn(cardFrameDescriptionVariants(), className)}
      {...props}
    />
  );
}

export type CardFrameActionPrimitiveProps = useRender.ComponentProps<"div">;

function CardFrameActionPrimitive({
  render,
  ...props
}: CardFrameActionPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-frame-action",
  } as CardFrameActionPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameActionVariants = cva({
  base: "col-start-2 nth-3:row-span-2 nth-3:row-start-1 inline-flex self-center justify-self-end",
});

export type CardFrameActionProps = CardFrameActionPrimitiveProps;

function CardFrameAction({ className, ...props }: CardFrameActionProps) {
  return (
    <CardFrameActionPrimitive
      className={cn(cardFrameActionVariants(), className)}
      {...props}
    />
  );
}

export type CardFrameFooterPrimitiveProps = useRender.ComponentProps<"div">;

function CardFrameFooterPrimitive({
  render,
  ...props
}: CardFrameFooterPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-frame-footer",
  } as CardFrameFooterPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFrameFooterVariants = cva({
  base: "px-6 py-4",
});

export type CardFrameFooterProps = CardFrameFooterPrimitiveProps;

function CardFrameFooter({ className, ...props }: CardFrameFooterProps) {
  return (
    <CardFrameFooterPrimitive
      className={cn(cardFrameFooterVariants(), className)}
      {...props}
    />
  );
}

export type CardHeaderPrimitiveProps = useRender.ComponentProps<"div">;

function CardHeaderPrimitive({ render, ...props }: CardHeaderPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-header",
  } as CardHeaderPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardHeaderVariants = cva({
  // CRD-2: the sibling padding selectors key off the *new* `card-panel` slot
  // name — the rename and these selectors only work together.
  base: "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 p-6 in-[[data-slot=card]:has(>[data-slot=card-panel])]:pb-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
});

export type CardHeaderProps = CardHeaderPrimitiveProps;

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <CardHeaderPrimitive
      className={cn(cardHeaderVariants(), className)}
      {...props}
    />
  );
}

export type CardTitlePrimitiveProps = useRender.ComponentProps<"div">;

function CardTitlePrimitive({ render, ...props }: CardTitlePrimitiveProps) {
  const defaultProps = { "data-slot": "card-title" } as CardTitlePrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardTitleVariants = cva({
  base: "font-heading font-semibold text-lg leading-none",
});

export type CardTitleProps = CardTitlePrimitiveProps;

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <CardTitlePrimitive
      className={cn(cardTitleVariants(), className)}
      {...props}
    />
  );
}

export type CardDescriptionPrimitiveProps = useRender.ComponentProps<"div">;

function CardDescriptionPrimitive({
  render,
  ...props
}: CardDescriptionPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-description",
  } as CardDescriptionPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardDescriptionVariants = cva({
  base: "text-muted-foreground text-sm",
});

export type CardDescriptionProps = CardDescriptionPrimitiveProps;

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <CardDescriptionPrimitive
      className={cn(cardDescriptionVariants(), className)}
      {...props}
    />
  );
}

export type CardActionPrimitiveProps = useRender.ComponentProps<"div">;

function CardActionPrimitive({ render, ...props }: CardActionPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-action",
  } as CardActionPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardActionVariants = cva({
  base: "col-start-2 row-span-2 row-start-1 inline-flex self-start justify-self-end",
});

export type CardActionProps = CardActionPrimitiveProps;

function CardAction({ className, ...props }: CardActionProps) {
  return (
    <CardActionPrimitive
      className={cn(cardActionVariants(), className)}
      {...props}
    />
  );
}

export type CardPanelPrimitiveProps = useRender.ComponentProps<"div">;

function CardPanelPrimitive({ render, ...props }: CardPanelPrimitiveProps) {
  const defaultProps = { "data-slot": "card-panel" } as CardPanelPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardPanelVariants = cva({
  // CRD-2: as with CardHeader, these `in-[…]` selectors depend on the coss
  // slot names of this part and its siblings.
  base: "flex-1 p-6 in-[[data-slot=card]:has(>[data-slot=card-header]:not(.border-b))]:pt-0 in-[[data-slot=card]:has(>[data-slot=card-footer]:not(.border-t))]:pb-0",
});

export type CardPanelProps = CardPanelPrimitiveProps;

function CardPanel({ className, ...props }: CardPanelProps) {
  return (
    <CardPanelPrimitive
      className={cn(cardPanelVariants(), className)}
      {...props}
    />
  );
}

export type CardFooterPrimitiveProps = useRender.ComponentProps<"div">;

function CardFooterPrimitive({ render, ...props }: CardFooterPrimitiveProps) {
  const defaultProps = {
    "data-slot": "card-footer",
  } as CardFooterPrimitiveProps;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

const cardFooterVariants = cva({
  // CRD-2: depends on the `card-panel` slot name.
  base: "flex items-center p-6 in-[[data-slot=card]:has(>[data-slot=card-panel])]:pt-4",
});

export type CardFooterProps = CardFooterPrimitiveProps;

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <CardFooterPrimitive
      className={cn(cardFooterVariants(), className)}
      {...props}
    />
  );
}

/** CRD-3: coss's own alias, so existing `CardContent` call sites need no rename. */
export {
  Card,
  CardAction,
  CardActionPrimitive,
  CardDescription,
  CardDescriptionPrimitive,
  CardFooter,
  CardFooterPrimitive,
  CardFrame,
  CardFrameAction,
  CardFrameActionPrimitive,
  CardFrameDescription,
  CardFrameDescriptionPrimitive,
  CardFrameFooter,
  CardFrameFooterPrimitive,
  CardFrameHeader,
  CardFrameHeaderPrimitive,
  CardFramePrimitive,
  CardFrameTitle,
  CardFrameTitlePrimitive,
  CardHeader,
  CardHeaderPrimitive,
  CardPanel,
  CardPanel as CardContent,
  CardPanelPrimitive,
  CardPanelPrimitive as CardContentPrimitive,
  CardPrimitive,
  CardTitle,
  CardTitlePrimitive,
  cardActionVariants,
  cardDescriptionVariants,
  cardFooterVariants,
  cardFrameActionVariants,
  cardFrameDescriptionVariants,
  cardFrameFooterVariants,
  cardFrameHeaderVariants,
  cardFrameTitleVariants,
  cardFrameVariants,
  cardHeaderVariants,
  cardPanelVariants,
  cardTitleVariants,
  cardVariants,
};
