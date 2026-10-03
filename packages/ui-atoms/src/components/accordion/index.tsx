import { Accordion as BaseUIAccordion } from "@base-ui/react/accordion";
import { cva } from "cva";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../utils.js";

// coss base `.coss-base/accordion.tsx` @8163481, plus ACC-2 (`headingLevel`),
// which the base's always-`h3` header cannot express. ACC-1 comes with the
// base: the chevron carries `data-slot="accordion-indicator"` and the rotate
// selector targets that slot instead of a bare `svg` child.

const accordionItemVariants = cva({ base: "border-b last:border-b-0" });

const accordionTriggerVariants = cva({
  base: "flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-64 data-panel-open:*:data-[slot=accordion-indicator]:rotate-180",
});

const accordionPanelVariants = cva({ base: "pt-0 pb-4" });

export type AccordionProps = BaseUIAccordion.Root.Props;

function Accordion(props: AccordionProps) {
  return <BaseUIAccordion.Root data-slot="accordion" {...props} />;
}

export type AccordionItemPrimitiveProps = BaseUIAccordion.Item.Props;

function AccordionItemPrimitive(props: AccordionItemPrimitiveProps) {
  return <BaseUIAccordion.Item data-slot="accordion-item" {...props} />;
}

export type AccordionItemProps = AccordionItemPrimitiveProps;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionItemPrimitive
      className={cn(accordionItemVariants(), className)}
      {...props}
    />
  );
}

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AccordionTriggerPrimitiveProps
  extends BaseUIAccordion.Trigger.Props {
  /**
   * ACC-2. Heading level of the element wrapping the trigger. Base UI renders
   * an `h3` by default; set this to keep the document outline free of skipped
   * levels (e.g. `2` when the accordion sits directly under the page `h1`).
   */
  headingLevel?: AccordionHeadingLevel;
}

function AccordionTriggerPrimitive({
  children,
  headingLevel,
  ...props
}: AccordionTriggerPrimitiveProps) {
  const HeadingTag = headingLevel ? (`h${headingLevel}` as const) : undefined;

  return (
    <BaseUIAccordion.Header
      className="flex"
      render={HeadingTag ? <HeadingTag /> : undefined}
    >
      <BaseUIAccordion.Trigger data-slot="accordion-trigger" {...props}>
        {children}
        <ChevronDownIcon
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 opacity-80 transition-transform duration-200 ease-in-out"
          data-slot="accordion-indicator"
        />
      </BaseUIAccordion.Trigger>
    </BaseUIAccordion.Header>
  );
}

export type AccordionTriggerProps = AccordionTriggerPrimitiveProps;

function AccordionTrigger({ className, ...props }: AccordionTriggerProps) {
  return (
    <AccordionTriggerPrimitive
      className={cn(accordionTriggerVariants(), className)}
      {...props}
    />
  );
}

export type AccordionPanelPrimitiveProps = BaseUIAccordion.Panel.Props;

interface AccordionPanelPrimitiveInternalProps
  extends AccordionPanelPrimitiveProps {
  /** Internal channel for the inner pane's class set. */
  paneClassName?: string;
}

function AccordionPanelPrimitive({
  children,
  paneClassName,
  ...props
}: AccordionPanelPrimitiveInternalProps) {
  return (
    <BaseUIAccordion.Panel
      className="h-(--accordion-panel-height) overflow-hidden text-muted-foreground text-sm transition-[height] duration-200 ease-in-out data-ending-style:h-0 data-starting-style:h-0"
      data-slot="accordion-panel"
      {...props}
    >
      <div className={paneClassName}>{children}</div>
    </BaseUIAccordion.Panel>
  );
}

export type AccordionPanelProps = AccordionPanelPrimitiveProps;

function AccordionPanel({ className, ...props }: AccordionPanelProps) {
  return (
    <AccordionPanelPrimitive
      paneClassName={cn(accordionPanelVariants(), className)}
      {...props}
    />
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionItemPrimitive,
  AccordionPanel,
  // The base ships this alias itself, so the retirement of shadcn aliases
  // does not reach it (same exception as `CardContent`).
  AccordionPanel as AccordionContent,
  AccordionPanelPrimitive,
  AccordionTrigger,
  AccordionTriggerPrimitive,
  accordionItemVariants,
  accordionPanelVariants,
  accordionTriggerVariants,
};
