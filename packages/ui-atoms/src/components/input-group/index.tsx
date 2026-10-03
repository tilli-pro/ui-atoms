"use client";

import type * as React from "react";
import { cva, type VariantProps } from "cva";
import { cn } from "../../utils.js";
import { Input, type InputProps } from "../input/index.js";
import { Textarea, type TextareaProps } from "../textarea/index.js";

// coss base `.coss-base/input-group.tsx` @8163481. No divergence id and no tilli lead
// touches this component, and `input-group` is not one of the fourteen the
// size-ramp hold-back names, so every class string is the base's verbatim.

const inputGroupVariants = cva({
  base: "relative inline-flex w-full min-w-0 items-center rounded-lg border border-input bg-background not-dark:bg-clip-padding text-base text-foreground shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-[input:disabled,textarea:disabled]:not-has-[input:focus-visible,textarea:focus-visible]:not-has-[input[aria-invalid],textarea[aria-invalid]]:before:shadow-[0_1px_--theme(--color-black/4%)] has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive/64 has-[input:focus-visible,textarea:focus-visible]:has-[input[aria-invalid],textarea[aria-invalid]]:ring-destructive/16 has-[textarea]:h-auto has-data-[align=block-end]:h-auto has-data-[align=block-start]:h-auto has-data-[align=block-end]:flex-col has-data-[align=block-start]:flex-col has-[input:focus-visible,textarea:focus-visible]:border-ring has-[input[aria-invalid],textarea[aria-invalid]]:border-destructive/36 has-autofill:bg-foreground/4 has-[input:disabled,textarea:disabled]:opacity-64 has-[input:disabled,textarea:disabled,input:focus-visible,textarea:focus-visible,input[aria-invalid],textarea[aria-invalid]]:shadow-none has-[input:focus-visible,textarea:focus-visible]:ring-[3px] sm:text-sm dark:bg-input/32 dark:has-autofill:bg-foreground/8 dark:has-[input[aria-invalid],textarea[aria-invalid]]:ring-destructive/24 dark:not-has-[input:disabled,textarea:disabled]:not-has-[input:focus-visible,textarea:focus-visible]:not-has-[input[aria-invalid],textarea[aria-invalid]]:before:shadow-[0_-1px_--theme(--color-white/6%)] has-data-[align=inline-start]:**:[[data-size=sm]_input]:ps-1.5 has-data-[align=inline-end]:**:[[data-size=sm]_input]:pe-1.5 *:[[data-slot=input-control],[data-slot=textarea-control]]:contents *:[[data-slot=input-control],[data-slot=textarea-control]]:before:hidden has-[[data-align=block-start],[data-align=block-end]]:**:[input]:h-auto has-data-[align=inline-start]:**:[input]:ps-2 has-data-[align=inline-end]:**:[input]:pe-2 has-data-[align=block-end]:**:[input]:pt-1.5 has-data-[align=block-start]:**:[input]:pb-1.5 **:[textarea]:min-h-20.5 **:[textarea]:resize-none **:[textarea]:py-[calc(--spacing(3)-1px)] **:[textarea]:max-sm:min-h-23.5 **:[textarea_button]:rounded-[calc(var(--radius-md)-1px)]",
});

const inputGroupAddonVariants = cva({
  base: "flex h-auto cursor-text select-none items-center justify-center gap-2 [&>kbd]:rounded-[calc(var(--radius)-5px)] in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5 sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5 not-has-[button]:**:[svg:not([class*='opacity-'])]:opacity-80",
  defaultVariants: { align: "inline-start" },
  variants: {
    align: {
      "block-end":
        "order-last w-full justify-start px-[calc(--spacing(3)-1px)] pb-[calc(--spacing(3)-1px)] [.border-t]:pt-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]",
      "block-start":
        "order-first w-full justify-start px-[calc(--spacing(3)-1px)] pt-[calc(--spacing(3)-1px)] [.border-b]:pb-[calc(--spacing(3)-1px)] [[data-size=sm]+&]:px-[calc(--spacing(2.5)-1px)]",
      "inline-end":
        "order-last pe-[calc(--spacing(3)-1px)] has-[>:last-child[data-slot=badge]]:-me-1.5 has-[>button]:-me-2 has-[>kbd:last-child]:me-[-0.35rem] [[data-size=sm]+&]:pe-[calc(--spacing(2.5)-1px)]",
      "inline-start":
        "order-first ps-[calc(--spacing(3)-1px)] has-[>:last-child[data-slot=badge]]:-ms-1.5 has-[>button]:-ms-2 has-[>kbd:last-child]:ms-[-0.35rem] [[data-size=sm]+&]:ps-[calc(--spacing(2.5)-1px)]",
    },
  },
});

const inputGroupTextVariants = cva({
  base: "flex items-center gap-2 truncate text-muted-foreground in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5 sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5",
});

export type InputGroupPrimitiveProps = React.ComponentProps<"div">;

function InputGroupPrimitive(props: InputGroupPrimitiveProps) {
  return <div data-slot="input-group" role="group" {...props} />;
}

export type InputGroupProps = InputGroupPrimitiveProps;

function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <InputGroupPrimitive
      className={cn(inputGroupVariants(), className)}
      {...props}
    />
  );
}

export interface InputGroupAddonPrimitiveProps
  extends React.ComponentProps<"div"> {
  align?: VariantProps<typeof inputGroupAddonVariants>["align"];
}

/**
 * Clicking the addon's own padding focuses the group's control, the way a
 * `<label>` would; a click that lands on an interactive descendant is left
 * alone. Behaviour, so it stays on the primitive.
 */
function InputGroupAddonPrimitive({
  align = "inline-start",
  ...props
}: InputGroupAddonPrimitiveProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: label-like affordance, not a control; a role here would add a second interactive element to the group's accessibility tree
    <div
      data-align={align}
      data-slot="input-group-addon"
      onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as Element;
        if (!event.currentTarget.contains(target)) return;

        const isInteractive = target.closest(
          "button, a, input, select, textarea, [role='button'], [role='combobox'], [role='listbox'], [data-slot='select-trigger']",
        );
        if (isInteractive) return;
        event.preventDefault();
        const parent = event.currentTarget.parentElement;
        const input = parent?.querySelector<
          HTMLInputElement | HTMLTextAreaElement
        >("input, textarea");
        if (input && !parent?.querySelector("input:focus, textarea:focus")) {
          input.focus();
        }
      }}
      {...props}
    />
  );
}

export type InputGroupAddonProps = InputGroupAddonPrimitiveProps;

function InputGroupAddon({
  align = "inline-start",
  className,
  ...props
}: InputGroupAddonProps) {
  return (
    <InputGroupAddonPrimitive
      align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  );
}

export type InputGroupTextProps = React.ComponentProps<"span">;

function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span className={cn(inputGroupTextVariants(), className)} {...props} />
  );
}

export type InputGroupInputProps = InputProps;

function InputGroupInput(props: InputGroupInputProps) {
  return <Input unstyled={true} {...props} />;
}

export type InputGroupTextareaProps = TextareaProps;

function InputGroupTextarea(props: InputGroupTextareaProps) {
  return <Textarea unstyled={true} {...props} />;
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupAddonPrimitive,
  InputGroupInput,
  InputGroupPrimitive,
  InputGroupText,
  InputGroupTextarea,
  inputGroupAddonVariants,
  inputGroupTextVariants,
  inputGroupVariants,
};
