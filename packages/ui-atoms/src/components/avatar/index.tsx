import { Avatar as BaseUIAvatar } from "@base-ui/react/avatar";
import { cva } from "cva";
import { cn } from "../../utils.js";

// coss base `.coss-base/avatar.tsx` @8163481, taken wholesale and split into
// the styled/primitive/variants triple. No responsive size pair to collapse: `size-8` is a fixed size.

const avatarVariants = cva({
  base: "relative isolate inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background align-middle font-medium text-xs",
});

const avatarImageVariants = cva({
  base: "absolute inset-0 z-10 size-full object-cover data-error:invisible data-loading:invisible",
});

const avatarFallbackVariants = cva({
  base: "absolute inset-0 flex size-full items-center justify-center rounded-full bg-muted",
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

export {
  Avatar,
  AvatarFallback,
  AvatarFallbackPrimitive,
  AvatarImage,
  AvatarImagePrimitive,
  AvatarPrimitive,
  avatarFallbackVariants,
  avatarImageVariants,
  avatarVariants,
};
