import { Fragment, useState } from "react";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@tilli.dev/ui-atoms/empty";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@tilli.dev/ui-atoms/select";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@tilli.dev/ui-atoms/timeline";
import { sameDay } from "../specs/common.js";
import {
  type Persona,
  resolveLabel,
  type TabContent,
  type TimelineEvent,
} from "../specs/types.js";
import { GapBadge, Money, StatusBadge } from "./cells.js";

const eventDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dayHeading = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function TabTimeline<D>({
  content,
  d,
  persona,
}: {
  content: Extract<TabContent<D>, { kind: "timeline" }>;
  d: D;
  persona: Persona;
}) {
  const t = (label: Parameters<typeof resolveLabel>[0]) =>
    resolveLabel(label, persona.terms);
  const [module, setModule] = useState("all");
  const all: TimelineEvent[] = content.events(d);
  const modules = [...new Set(all.map((e) => e.module))].sort();
  const items = module === "all" ? all : all.filter((e) => e.module === module);
  const selectItems = [
    { value: "all", label: "All modules" },
    ...modules.map((m) => ({ value: m, label: m })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={selectItems}
          onValueChange={(value) => setModule(value ?? "all")}
          value={module}
        >
          <SelectTrigger aria-label="Module" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <GapBadge id="filter-builder" />
        <p className="text-muted-foreground text-sm tabular-nums">
          {`Showing ${items.length} of ${all.length} events`}
        </p>
      </div>
      {items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t(content.empty.title)}</EmptyTitle>
            <EmptyDescription>{t(content.empty.description)}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Timeline value={items.length}>
          {items.map((event, i) => {
            const previous = i > 0 ? items[i - 1] : undefined;
            const newDay = !(previous && sameDay(previous.at, event.at));
            return (
              <Fragment key={event.id}>
                {newDay ? (
                  <p className="pt-2 pb-1 text-muted-foreground text-xs uppercase">
                    {dayHeading.format(event.at)}
                  </p>
                ) : null}
                <TimelineItem step={i + 1}>
                  <TimelineHeader>
                    <TimelineIndicator />
                    <TimelineTitle>{event.title}</TimelineTitle>
                    <TimelineDate>{eventDate.format(event.at)}</TimelineDate>
                  </TimelineHeader>
                  <TimelineContent>
                    {event.description ? <p>{event.description}</p> : null}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{event.module}</Badge>
                      {event.status ? (
                        <StatusBadge value={event.status} />
                      ) : null}
                      {event.amount !== undefined ? (
                        <Money
                          currency={persona.currency}
                          value={event.amount}
                        />
                      ) : null}
                    </div>
                  </TimelineContent>
                  {i < items.length - 1 ? <TimelineSeparator /> : null}
                </TimelineItem>
              </Fragment>
            );
          })}
        </Timeline>
      )}
    </div>
  );
}
