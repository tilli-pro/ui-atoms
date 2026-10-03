import type * as React from "react";
import { cva } from "cva";
import { cn } from "../../utils.js";

const skeletonVariants = cva({
  base: "animate-skeleton rounded-sm [--skeleton-highlight:--alpha(var(--color-white)/64%)] [background:linear-gradient(120deg,transparent_40%,var(--skeleton-highlight),transparent_60%)_var(--color-muted)_0_0_/_200%_100%_fixed] dark:[--skeleton-highlight:--alpha(var(--color-white)/4%)]",
});

export type SkeletonPrimitiveProps = React.ComponentProps<"div">;

function SkeletonPrimitive(props: SkeletonPrimitiveProps) {
  return <div data-slot="skeleton" {...props} />;
}

export type SkeletonProps = SkeletonPrimitiveProps;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <SkeletonPrimitive
      className={cn(skeletonVariants(), className)}
      {...props}
    />
  );
}

export { Skeleton, SkeletonPrimitive, skeletonVariants };
