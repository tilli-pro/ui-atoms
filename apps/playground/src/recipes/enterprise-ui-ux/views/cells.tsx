import { Avatar, AvatarFallback } from "@tilli.dev/ui-atoms/avatar";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipTrigger,
} from "@tilli.dev/ui-atoms/tooltip";
import { cn } from "@tilli.dev/ui-atoms/utils";
import { type GapId, gaps } from "../gaps.js";
import type { Format } from "../specs/types.js";

type Tone = "success" | "error" | "warning" | "info" | "secondary";

const toneWords: Record<Exclude<Tone, "secondary">, ReadonlySet<string>> = {
  success: new Set(
    "paid approved completed active connected resolved closed won delivered published confirmed accepted online available met".split(
      " ",
    ),
  ),
  error: new Set(
    "overdue failed rejected breached lost void disputed dead_letter cancelled offline".split(
      " ",
    ),
  ),
  warning: new Set(
    "draft pending pending_review pending_approval pending_payment submitted scheduled invited on_hold waiting escalated held away busy".split(
      " ",
    ),
  ),
  info: new Set(
    "sent viewed open in_progress new contacted qualified processing received".split(
      " ",
    ),
  ),
};

export const statusTone = (value: string): Tone => {
  const key = value.toLowerCase().replace(/[\s-]+/g, "_");
  for (const tone of ["success", "error", "warning", "info"] as const) {
    if (toneWords[tone].has(key)) return tone;
  }
  return "secondary";
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge variant={statusTone(value)}>{value}</Badge>;
}

const dash = <span className="text-muted-foreground">—</span>;

export function Money({
  value,
  currency,
}: {
  value: number | null;
  currency: "USD";
}) {
  if (value === null) return dash;
  return (
    <span className="block text-right tabular-nums">
      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        value,
      )}
    </span>
  );
}

export function DateCell({
  value,
  withTime,
}: {
  value: Date | string | null;
  withTime?: boolean;
}) {
  if (value === null) return dash;
  const date = value instanceof Date ? value : new Date(value);
  const text = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
  return <span className="tabular-nums">{text}</span>;
}

const WHITESPACE = /\s+/;

const initials = (name: string) =>
  name
    .split(WHITESPACE)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function PartyCell({
  name,
  subline,
}: {
  name: string;
  subline?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium">{name}</span>
        {subline ? (
          <span className="truncate text-muted-foreground text-xs">
            {subline}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function GapBadge({ id }: { id: GapId }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge tabIndex={0} variant="warning">
            Needs review
          </Badge>
        }
      />
      <TooltipPopup>{gaps[id].reason}</TooltipPopup>
    </Tooltip>
  );
}

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function Cell({
  format,
  value,
  currency,
}: {
  format: Format;
  value: unknown;
  currency: "USD";
}) {
  if (value === null || value === undefined || value === "") return dash;
  switch (format) {
    case "status":
      return <StatusBadge value={String(value)} />;
    case "badge":
      return <Badge variant="secondary">{String(value)}</Badge>;
    case "money":
      return (
        <Money currency={currency} value={isNumber(value) ? value : null} />
      );
    case "date":
    case "datetime":
      return (
        <DateCell
          value={value as Date | string}
          withTime={format === "datetime"}
        />
      );
    case "party": {
      if (typeof value === "string") return <PartyCell name={value} />;
      const party = value as { name: string; subline?: string };
      return party.subline === undefined ? (
        <PartyCell name={party.name} />
      ) : (
        <PartyCell name={party.name} subline={party.subline} />
      );
    }
    case "count":
      return (
        <span className="tabular-nums">
          {isNumber(value) ? value.toLocaleString("en-US") : String(value)}
        </span>
      );
    case "percent":
      return (
        <span className="tabular-nums">
          {isNumber(value) ? `${value.toFixed(1)}%` : String(value)}
        </span>
      );
    case "duration":
      return (
        <span className="tabular-nums">
          {isNumber(value) ? formatDuration(value) : String(value)}
        </span>
      );
    case "boolean":
      return (
        <span className={cn(!value && "text-muted-foreground")}>
          {value ? "Yes" : "No"}
        </span>
      );
    case "link":
      return (
        <Button className="h-auto p-0" size="sm" variant="link">
          {String(value)}
        </Button>
      );
    default:
      return <span>{String(value)}</span>;
  }
}
