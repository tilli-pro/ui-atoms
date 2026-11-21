import type * as React from "react";
import { Avatar as BaseUIAvatar } from "@base-ui/react/avatar";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/avatar.tsx` @b2336c4, taken wholesale and split into
// the styled/primitive/variants triple. No responsive size pair to collapse: the
// size is `--avatar-size` (default `--spacing(8)`), which also scales the
// fallback text and, inside `AvatarGroup`, the overlap and the cut-out.

const AVATAR_GROUP_CUT =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/svg%3E\")";

const avatarVariants = cva({
  base: "relative isolate inline-flex size-(--avatar-size,--spacing(8)) shrink-0 select-none items-center justify-center overflow-hidden rounded-full align-middle font-medium text-[calc(var(--avatar-size,--spacing(8))*0.375)]/none",
});

const avatarImageVariants = cva({
  base: "absolute inset-0 z-10 size-full rounded-[inherit] object-cover data-error:invisible data-loading:invisible",
});

const avatarFallbackVariants = cva({
  base: "absolute inset-0 flex size-full items-center justify-center rounded-[inherit] bg-border",
});

export type AvatarPrimitiveProps = BaseUIAvatar.Root.Props;

function AvatarPrimitive(props: AvatarPrimitiveProps) {
  return <BaseUIAvatar.Root data-slot="avatar" {...props} />;
}

export type AvatarProps = AvatarPrimitiveProps;

function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive className={cn(avatarVariants(), className)} {...props} />
  );
}

export type AvatarImagePrimitiveProps = BaseUIAvatar.Image.Props;

function AvatarImagePrimitive(props: AvatarImagePrimitiveProps) {
  return <BaseUIAvatar.Image data-slot="avatar-image" {...props} />;
}

export type AvatarImageProps = AvatarImagePrimitiveProps;

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarImagePrimitive
      className={cn(avatarImageVariants(), className)}
      {...props}
    />
  );
}

export type AvatarFallbackPrimitiveProps = BaseUIAvatar.Fallback.Props;

function AvatarFallbackPrimitive(props: AvatarFallbackPrimitiveProps) {
  return <BaseUIAvatar.Fallback data-slot="avatar-fallback" {...props} />;
}

export type AvatarFallbackProps = AvatarFallbackPrimitiveProps;

function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarFallbackPrimitive
      className={cn(avatarFallbackVariants(), className)}
      {...props}
    />
  );
}

const avatarGroupVariants = cva({
  base: [
    "flex w-fit items-center",
    "[--avatar-group-size:var(--avatar-size,--spacing(8))]",
    "[--avatar-group-gap:var(--avatar-gap,calc(var(--avatar-group-size)/16))]",
    "[--avatar-group-overlap:var(--avatar-overlap,calc(var(--avatar-group-size)*0.3))]",
    "[--avatar-group-cut-end:calc(var(--avatar-group-size)*1.5-var(--avatar-group-overlap))]",
    "[--avatar-group-cut-radius:calc(var(--avatar-group-size)/2+var(--avatar-group-gap))]",
    "[--avatar-group-cut-start:calc(var(--avatar-group-overlap)-var(--avatar-group-size)/2)]",
    "[--avatar-group-mask-position:0_0,calc(var(--avatar-group-cut-x)-var(--avatar-group-cut-radius))_50%]",
    "[--avatar-group-mask-size:100%_100%,calc(var(--avatar-group-cut-radius)*2)_calc(var(--avatar-group-cut-radius)*2)]",
    "[--avatar-group-mask:none]",
    "supports-[mask-composite:subtract]:[--avatar-group-mask:var(--avatar-group-cut-image),var(--avatar-group-cut-image)]",
    "[--avatar-group-nudge:var(--avatar-nudge,calc((var(--avatar-group-overlap)+var(--avatar-group-gap))*0.3))]",
    "*:not-first:-ms-(--avatar-group-overlap)",
  ],
  defaultVariants: { topmost: "first" },
  variants: {
    topmost: {
      first:
        "*:not-first:mask-(--avatar-group-mask) *:not-first:mask-subtract *:not-first:mask-position-(--avatar-group-mask-position) *:not-first:mask-no-repeat *:not-first:mask-size-(--avatar-group-mask-size) [--avatar-group-cut-x:var(--avatar-group-cut-start)] *:not-first:*:data-[slot=avatar-fallback]:ps-[calc(var(--avatar-group-nudge)*2)] supports-[mask-composite:subtract]:*:not-first:rounded-none rtl:[--avatar-group-cut-x:var(--avatar-group-cut-end)]",
      last: "*:not-last:mask-(--avatar-group-mask) *:not-last:mask-subtract *:not-last:mask-position-(--avatar-group-mask-position) *:not-last:mask-no-repeat *:not-last:mask-size-(--avatar-group-mask-size) [--avatar-group-cut-x:var(--avatar-group-cut-end)] *:not-last:*:data-[slot=avatar-fallback]:pe-[calc(var(--avatar-group-nudge)*2)] supports-[mask-composite:subtract]:*:not-last:rounded-none rtl:[--avatar-group-cut-x:var(--avatar-group-cut-start)]",
    },
  },
});

const avatarGroupCountVariants = cva({ base: "text-muted-foreground" });

export interface AvatarGroupPrimitiveProps extends React.ComponentProps<"div"> {
  /** Which end of the row sits on top of its neighbours. */
  topmost?: "first" | "last";
}

/** The cut-out image is a custom property the styled part's mask classes read;
 *  it is set here because it is data, not theme styling. */
function AvatarGroupPrimitive({
  style,
  topmost = "first",
  ...props
}: AvatarGroupPrimitiveProps) {
  return (
    <div
      data-slot="avatar-group"
      data-topmost={topmost}
      style={
        {
          "--avatar-group-cut-image": AVATAR_GROUP_CUT,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export type AvatarGroupProps = AvatarGroupPrimitiveProps;

/** Overlapping avatars, each cut out around its neighbour. Size the row with
 *  `--avatar-size`; tune it with `--avatar-gap`, `--avatar-overlap` and
 *  `--avatar-nudge`. */
function AvatarGroup({
  className,
  topmost = "first",
  ...props
}: AvatarGroupProps) {
  return (
    <AvatarGroupPrimitive
      className={cn(avatarGroupVariants({ topmost }), className)}
      topmost={topmost}
      {...props}
    />
  );
}

export type AvatarGroupCountProps = AvatarPrimitiveProps;

/** The "+3" at the end of a group: an avatar whose fallback is its children. */
function AvatarGroupCount({
  children,
  className,
  ...props
}: AvatarGroupCountProps) {
  return (
    <Avatar
      className={cn(avatarGroupCountVariants(), className)}
      data-slot="avatar-group-count"
      {...props}
    >
      <AvatarFallback>{children}</AvatarFallback>
    </Avatar>
  );
}

export {
  Avatar,
  AvatarFallback,
  AvatarFallbackPrimitive,
  AvatarGroup,
  AvatarGroupCount,
  AvatarGroupPrimitive,
  AvatarImage,
  AvatarImagePrimitive,
  AvatarPrimitive,
  avatarFallbackVariants,
  avatarGroupCountVariants,
  avatarGroupVariants,
  avatarImageVariants,
  avatarVariants,
};
