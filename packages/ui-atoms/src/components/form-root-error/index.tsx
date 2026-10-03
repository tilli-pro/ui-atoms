import type * as React from "react";
import { cva, type VariantProps } from "cva";
import { TriangleAlert } from "lucide-react";
import { cn } from "../../utils.js";
import { Card, CardDescription, CardHeader, CardTitle } from "../card/index.js";

const formRootErrorVariants = cva({
  base: "text-[0.8rem] font-medium text-destructive text-center",
  variants: {
    variant: { default: "", card: "text-primary" },
    size: { default: "", sm: "text-sm", md: "text-base", lg: "text-lg" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
const formRootErrorCardHeaderVariants = cva({
  base: "flex-row items-center space-x-2 px-2 py-1.5 sm:space-x-4 sm:px-3 sm:py-2",
});

function isBlank(message: React.ReactNode): boolean {
  return (
    message === undefined ||
    message === null ||
    message === false ||
    (typeof message === "string" && message.trim() === "")
  );
}

export interface FormRootErrorPrimitiveProps
  extends Omit<React.ComponentProps<"p">, "title"> {
  as?: React.ElementType;
  /** Resolved, already-translated message. Nothing renders when blank. */
  message?: React.ReactNode;
  /** Card variant heading (v2 rendered the translated "letsTryAgain"). */
  title?: React.ReactNode;
  variant?: "default" | "card";
  /** Card variant: show the alert icon (v2 always did). */
  withIcon?: boolean;
  cardHeaderClassName?: string;
}

function FormRootErrorPrimitive({
  as: Component = "p",
  message,
  title,
  variant = "default",
  withIcon = true,
  cardHeaderClassName,
  className,
  ...props
}: FormRootErrorPrimitiveProps) {
  if (isBlank(message)) return null;
  if (variant === "card") {
    return (
      <Card
        className={className}
        data-slot="form-root-error"
        {...(props as React.ComponentProps<"div">)}
      >
        <CardHeader className={cardHeaderClassName}>
          {withIcon && <TriangleAlert className="size-14 min-h-14 min-w-14" />}
          <div className="space-y-1">
            <CardTitle className="text-sm!">{title}</CardTitle>
            <CardDescription className="text-sm!">{message}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Component className={className} data-slot="form-root-error" {...props}>
      {message}
    </Component>
  );
}

export interface FormRootErrorProps extends FormRootErrorPrimitiveProps {
  size?: VariantProps<typeof formRootErrorVariants>["size"];
}

function FormRootError({
  className,
  cardHeaderClassName,
  variant = "default",
  size,
  ...props
}: FormRootErrorProps) {
  return (
    <FormRootErrorPrimitive
      cardHeaderClassName={cn(
        formRootErrorCardHeaderVariants(),
        cardHeaderClassName,
      )}
      className={cn(formRootErrorVariants({ variant, size }), className)}
      variant={variant}
      {...props}
    />
  );
}

export {
  FormRootError,
  FormRootErrorPrimitive,
  formRootErrorCardHeaderVariants,
  formRootErrorVariants,
};
