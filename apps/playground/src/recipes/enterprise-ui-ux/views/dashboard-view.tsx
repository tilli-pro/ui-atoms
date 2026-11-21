import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@tilli.dev/ui-atoms/empty";
import {
  Meter,
  MeterIndicator,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from "@tilli.dev/ui-atoms/meter";
import { NumberTicker } from "@tilli.dev/ui-atoms/number-ticker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tilli.dev/ui-atoms/table";
import { cn } from "@tilli.dev/ui-atoms/utils";
import type { LucideIcon } from "lucide-react";
import {
  type DashboardSpec,
  type PanelSpec,
  type Persona,
  resolveLabel,
} from "../specs/types.js";
import { Cell, GapBadge } from "./cells.js";
import { GapPlaceholder } from "./gap-placeholder.js";
import { readValue } from "./list-state.js";

const TABLE_ROWS = 6;

type DashboardViewProps = {
  spec: DashboardSpec;
  persona: Persona;
  title: string;
  blurb: string;
  Icon: LucideIcon;
};

export function DashboardView({
  spec,
  persona,
  title,
  blurb,
  Icon,
}: DashboardViewProps) {
  const t = (label: Parameters<typeof resolveLabel>[0]) =>
    resolveLabel(label, persona.terms);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-semibold text-2xl">
          <Icon className="size-6" />
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{blurb}</p>
      </header>
      <section
        aria-label="Key figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {spec.stats.map((stat) => (
          <Card key={t(stat.label)}>
            <CardHeader>
              <CardDescription>{t(stat.label)}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {typeof stat.value === "number" ? (
                  <NumberTicker
                    decimalPlaces={Number.isInteger(stat.value) ? 0 : 1}
                    value={stat.value}
                  />
                ) : (
                  stat.value
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
              {t(stat.hint)}
              {stat.gap ? <GapBadge id={stat.gap} /> : null}
            </CardContent>
          </Card>
        ))}
      </section>
      <section aria-label="Panels" className="grid gap-4 lg:grid-cols-3">
        {spec.panels.map((panel) => (
          <Card key={t(panel.title)}>
            <CardHeader>
              <CardTitle>{t(panel.title)}</CardTitle>
              <CardDescription>{t(panel.description)}</CardDescription>
              {panel.gap && panel.kind !== "placeholder" ? (
                <CardAction>
                  <GapBadge id={panel.gap} />
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              <PanelBody panel={panel} persona={persona} />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function PanelBody({ panel, persona }: { panel: PanelSpec; persona: Persona }) {
  const t = (label: Parameters<typeof resolveLabel>[0]) =>
    resolveLabel(label, persona.terms);

  switch (panel.kind) {
    case "table":
      return (
        <Table variant="card">
          <TableHeader>
            <TableRow>
              {panel.columns.map((column) => (
                <TableHead
                  className={cn(column.align === "end" && "text-end")}
                  key={column.key}
                >
                  {t(column.header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {panel.rows.slice(0, TABLE_ROWS).map((row) => (
              <TableRow key={row.id}>
                {panel.columns.map((column) => (
                  <TableCell
                    className={cn(column.align === "end" && "text-end")}
                    key={column.key}
                  >
                    <Cell
                      currency={persona.currency}
                      format={column.format}
                      value={readValue(column, row)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    case "list":
      return (
        <dl className="flex flex-col gap-3">
          {panel.items.map((item) => (
            <div
              className="flex items-start justify-between gap-3"
              key={t(item.label)}
            >
              <div className="flex flex-col">
                <dt className="text-muted-foreground text-sm">
                  {t(item.label)}
                </dt>
                {item.hint ? (
                  <dd className="text-muted-foreground text-xs">
                    {t(item.hint)}
                  </dd>
                ) : null}
              </div>
              <dd className="text-sm tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      );
    case "meters":
      return (
        <div className="flex flex-col gap-4">
          {panel.meters.map((meter) => (
            <Meter key={t(meter.label)} max={meter.max} value={meter.value}>
              <div className="flex items-center justify-between gap-2">
                <MeterLabel>{t(meter.label)}</MeterLabel>
                <MeterValue>{() => meter.display}</MeterValue>
              </div>
              <MeterTrack>
                <MeterIndicator />
              </MeterTrack>
            </Meter>
          ))}
        </div>
      );
    default:
      return panel.gap ? (
        <GapPlaceholder id={panel.gap} message={panel.message} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyDescription>{panel.message}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
  }
}
