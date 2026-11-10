import {
  ArrowRightLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  FileUp,
  MessageSquareReply,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Siren,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { ANCHOR } from "../mock/random.js";
import {
  type EscalationStatus,
  type Presence,
  type SupportAgent,
  type SupportCall,
  type SupportEscalation,
  type SupportThread,
  type SupportTicket,
  supportData,
  type ThreadStatus,
  type TicketStatus,
} from "../mock/support.js";
import {
  type AnyList,
  capitalise,
  DAY,
  includes,
  lead,
  searchBy,
} from "./finance/common.js";
import type {
  ActionSpec,
  ChipSpec,
  ListSpec,
  ModuleSpecs,
  Persona,
  SegmentSpec,
  SelectFilterSpec,
} from "./types.js";

const HOUR = 3_600_000;

const TRAILING_S = /s$/;
const singular = (value: string) => value.replace(TRAILING_S, "");

const emptyCopy = (
  title: string,
  description = "Try adjusting your search criteria.",
) => ({
  title,
  description,
});

const closedLike = new Set<TicketStatus>(["resolved", "confirmed", "closed"]);
const isOpenTicket = (row: SupportTicket) => !closedLike.has(row.status);

const statusChips = <R extends { status: string }>(
  statuses: string[],
): ChipSpec<R & { id: string }>[] =>
  statuses.map((status) => ({
    key: status,
    label: capitalise(status),
    predicate: (row) => row.status === status,
  }));

const age = (from: Date) => {
  const hours = Math.max(
    0,
    Math.floor((ANCHOR.getTime() - from.getTime()) / HOUR),
  );
  return hours >= 48 ? `${Math.floor(hours / 24)}d` : `${hours}h`;
};

const exportAction: ActionSpec = {
  label: "Export",
  icon: Download,
  variant: "outline",
};

const sla = (due: Date | null, open: boolean) => {
  if (due === null) return "None";
  if (open && due.getTime() < ANCHOR.getTime()) return "Breached";
  return "On track";
};

/* ---------------------------------------------------------------- Inbox */

const threadStatuses: ThreadStatus[] = [
  "unread",
  "read",
  "replied",
  "escalated",
];

const threadsSegment: SegmentSpec<SupportThread> = {
  key: "threads",
  label: "Threads",
  rows: (persona) => supportData(persona).threads,
  total: (persona) => supportData(persona).totals.threads,
  columns: [
    {
      key: "channel",
      header: "Channel",
      format: "badge",
      accessor: (row) => capitalise(row.channel),
      sortable: false,
    },
    {
      key: "from",
      header: "From",
      format: "party",
      accessor: (row) => ({ name: row.from, subline: row.fromDetail }),
      sortable: false,
    },
    { key: "subject", header: "Subject", format: "text", sortable: false },
    { key: "preview", header: "Preview", format: "text", sortable: false },
    {
      key: "receivedAt",
      header: "Received",
      format: "datetime",
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
    {
      key: "assignedTo",
      header: "Assigned",
      format: "text",
      accessor: (row) => row.assignedTo ?? "Unassigned",
      sortable: false,
    },
  ],
  chips: threadStatuses.map((status) => ({
    key: status,
    label: capitalise(status),
    predicate: (row: SupportThread) => row.status === status,
  })),
  selects: [
    {
      key: "channel",
      label: "channels",
      options: (["email", "sms", "chat"] as const).map((channel) => ({
        value: channel,
        label: capitalise(channel),
        predicate: (row: SupportThread) => row.channel === channel,
      })),
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Assign", icon: UserPlus },
    { label: "Reply", icon: MessageSquareReply, gap: "rich-text" },
    { label: "Escalate", icon: Siren, variant: "destructive" },
  ],
  empty: emptyCopy("No messages found"),
};

const escalationStatuses: EscalationStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

const escalationsSegment: SegmentSpec<SupportEscalation> = {
  key: "escalations",
  label: "Escalations",
  rows: (persona) => supportData(persona).escalations,
  total: (persona) => supportData(persona).totals.escalations,
  columns: [
    { key: "subject", header: "Subject", format: "text", sortable: false },
    {
      key: "contact",
      header: "Contact / Org",
      format: "party",
      accessor: (row) => ({
        name: row.contact,
        ...(row.organization ? { subline: row.organization } : {}),
      }),
      sortable: false,
    },
    {
      key: "confidence",
      header: "Confidence",
      format: "percent",
      accessor: (row) => row.confidence * 100,
      align: "end",
      sortable: false,
    },
    {
      key: "priority",
      header: "Priority",
      format: "badge",
      accessor: (row) => capitalise(row.priority),
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
    {
      key: "assignedTo",
      header: "Assigned",
      format: "text",
      accessor: (row) => row.assignedTo ?? "Unassigned",
      sortable: false,
    },
    {
      key: "age",
      header: "Age",
      format: "text",
      accessor: (row) => age(row.createdAt),
      sortable: false,
    },
    {
      key: "sla",
      header: "SLA",
      format: "status",
      accessor: (row) =>
        row.slaDueAt.getTime() < ANCHOR.getTime() &&
        row.status !== "resolved" &&
        row.status !== "closed"
          ? "Breached"
          : "On track",
      sortable: false,
    },
  ],
  chips: statusChips<SupportEscalation>(escalationStatuses),
  selects: [
    {
      key: "priority",
      label: "priorities",
      options: (["critical", "high", "medium", "low"] as const).map(
        (priority) => ({
          value: priority,
          label: capitalise(priority),
          predicate: (row: SupportEscalation) => row.priority === priority,
        }),
      ),
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Assign", icon: UserPlus },
    { label: "Resolve", icon: CheckCircle2 },
  ],
  empty: emptyCopy("No escalations found"),
};

const callRange = (days: number | "today") => (row: SupportCall) =>
  days === "today"
    ? row.startedAt.toISOString().slice(0, 10) ===
      ANCHOR.toISOString().slice(0, 10)
    : ANCHOR.getTime() - row.startedAt.getTime() <= days * DAY;

const callSelects: SelectFilterSpec<SupportCall>[] = [
  {
    key: "direction",
    label: "directions",
    options: (["inbound", "outbound"] as const).map((direction) => ({
      value: direction,
      label: capitalise(direction),
      predicate: (row: SupportCall) => row.direction === direction,
    })),
  },
  {
    key: "period",
    label: "dates",
    options: [
      { value: "today", label: "Today", predicate: callRange("today") },
      { value: "7d", label: "7 days", predicate: callRange(7) },
      { value: "30d", label: "30 days", predicate: callRange(30) },
    ],
  },
];

const callsSegment: SegmentSpec<SupportCall> = {
  key: "calls",
  label: "Calls",
  rows: (persona) => supportData(persona).calls,
  total: (persona) => supportData(persona).totals.calls,
  columns: [
    {
      key: "type",
      header: "Type",
      format: "badge",
      accessor: (row) => capitalise(row.type),
      sortable: false,
    },
    {
      key: "direction",
      header: "Direction",
      format: "badge",
      accessor: (row) => capitalise(row.direction),
      sortable: false,
    },
    {
      key: "contact",
      header: "Contact",
      format: "text",
      accessor: (row) => row.contact,
      sortable: false,
    },
    {
      key: "organization",
      header: "Organization",
      format: "text",
      accessor: (row) => row.organization,
      sortable: false,
    },
    { key: "phone", header: "Phone", format: "text", sortable: false },
    {
      key: "durationMinutes",
      header: "Duration",
      format: "duration",
      accessor: (row) => row.durationMinutes,
      align: "end",
      sortable: false,
    },
    { key: "agent", header: "Agent", format: "text", sortable: false },
    { key: "startedAt", header: "Started", format: "datetime", sortable: true },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
  ],
  chips: statusChips<SupportCall>(["completed", "missed"]),
  selects: callSelects,
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Call back", icon: PhoneCall },
  ],
  empty: emptyCopy("No calls found"),
};

const inboxSpec: AnyList = {
  key: "inbox",
  title: "Inbox",
  description: "Messages, AI escalations and call history in one place.",
  ...lead(threadsSegment),
  segments: [threadsSegment, escalationsSegment, callsSegment],
  pageActions: [
    { label: "Compose", icon: Pencil, gap: "rich-text" },
    exportAction,
  ],
  search: searchBy(
    "subject",
    "from",
    "reference",
    "contact",
    "party",
    "phone",
    "organization",
  ),
  empty: emptyCopy("No messages found"),
};

/* -------------------------------------------------------------- Tickets */

const groups: { key: string; label: string; statuses: TicketStatus[] }[] = [
  {
    key: "open",
    label: "Open",
    statuses: ["new", "triaged", "assigned", "reopened"],
  },
  { key: "in_progress", label: "In progress", statuses: ["in_progress"] },
  {
    key: "waiting",
    label: "Waiting",
    statuses: ["waiting_customer", "waiting_internal"],
  },
  { key: "resolved", label: "Resolved", statuses: ["resolved", "confirmed"] },
  { key: "closed", label: "Closed", statuses: ["closed"] },
];

const ticketsSpec: ListSpec<SupportTicket> = {
  key: "tickets",
  title: (t) => t.tickets,
  description: "Track customer issues through to resolution.",
  rows: (persona) => supportData(persona).tickets,
  total: (persona) => supportData(persona).totals.tickets,
  selectable: false,
  columns: [
    { key: "number", header: "Number", format: "link", sortable: true },
    {
      key: "subject",
      header: "Subject",
      format: "party",
      accessor: (row) => ({
        name: row.subject,
        ...(row.category ? { subline: row.category } : {}),
      }),
      sortable: false,
    },
    {
      key: "customer",
      header: "Customer",
      format: "party",
      accessor: (row) => ({
        name: row.customer,
        ...(row.customerOrganization
          ? { subline: row.customerOrganization }
          : {}),
      }),
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
    {
      key: "priority",
      header: "Priority",
      format: "badge",
      accessor: (row) => capitalise(row.priority),
      sortable: true,
    },
    {
      key: "sla",
      header: "SLA",
      format: "status",
      accessor: (row) => sla(row.slaDueAt, isOpenTicket(row)),
      sortable: false,
    },
    {
      key: "assignedTo",
      header: "Assigned",
      format: "text",
      accessor: (row) => row.assignedTo ?? "Unassigned",
      sortable: false,
    },
  ],
  chips: groups.map((group) => ({
    key: group.key,
    label: group.label,
    predicate: (row: SupportTicket) => group.statuses.includes(row.status),
  })),
  selects: [
    {
      key: "priority",
      label: "priorities",
      options: (["urgent", "high", "medium", "low"] as const).map(
        (priority) => ({
          value: priority,
          label: capitalise(priority),
          predicate: (row: SupportTicket) => row.priority === priority,
        }),
      ),
    },
    {
      key: "assignee",
      label: "assignees",
      options: [
        { value: "mine", label: "Mine", predicate: (row) => row.mine },
        {
          value: "unassigned",
          label: "Unassigned",
          predicate: (row) => row.assignedTo === null,
        },
      ],
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Assign", icon: UserCheck },
    { label: "Change status", icon: ArrowRightLeft },
  ],
  pageActions: [
    { label: (t) => `Create ${singular(t.tickets).toLowerCase()}`, icon: Plus },
    exportAction,
    {
      label: "Attach",
      icon: FileUp,
      variant: "outline",
      gap: "file-import",
    },
  ],
  search: (row, query) =>
    includes(row.subject, query) || includes(row.number, query),
  empty: {
    title: (t) => `No ${t.tickets.toLowerCase()} found`,
    description: "Try adjusting your search or filter criteria.",
  },
};

/* ----------------------------------------------------------- Agent desk */

const presences: Presence[] = ["available", "busy", "away", "offline"];

const agentDeskSpec: ListSpec<SupportAgent> = {
  key: "agent-desk",
  title: "Agent desk",
  description: "Who is on shift, on a call and holding tickets.",
  rows: (persona) => supportData(persona).agents,
  selectable: false,
  gaps: ["softphone"],
  columns: [
    {
      key: "name",
      header: "Agent",
      format: "party",
      accessor: (row) => ({ name: row.name, subline: row.email }),
      sortable: false,
    },
    {
      key: "presence",
      header: "Presence",
      format: "status",
      accessor: (row) => capitalise(row.presence),
      sortable: false,
    },
    {
      key: "openTickets",
      header: "Open tickets",
      format: "count",
      align: "end",
      sortable: false,
    },
    { key: "onCall", header: "On call", format: "boolean", sortable: false },
    {
      key: "lastSeenAt",
      header: "Last seen",
      format: "datetime",
      sortable: false,
    },
  ],
  chips: presences.map((presence) => ({
    key: presence,
    label: capitalise(presence),
    predicate: (row: SupportAgent) => row.presence === presence,
  })),
  rowActions: [
    { label: "Open profile", icon: ExternalLink },
    { label: "Assign ticket", icon: UserPlus },
  ],
  pageActions: [
    { label: "Set presence", icon: UserCheck, variant: "outline" },
    { label: "Phone dock", icon: Phone, variant: "outline", gap: "softphone" },
  ],
  search: (row, query) =>
    includes(row.name, query) || includes(row.email, query),
  empty: emptyCopy("No agents found"),
};

/* ------------------------------------------------------------ Dashboard */

const dashboard = (persona: Persona) => {
  const data = supportData(persona);
  const now = ANCHOR.getTime();
  const open = data.tickets.filter(isOpenTicket);
  const atRisk = open.filter(
    (row) => row.slaDueAt !== null && row.slaDueAt.getTime() - now <= 4 * HOUR,
  );
  const watch = open
    .flatMap((row) => (row.slaDueAt ? [{ row, due: row.slaDueAt }] : []))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 6)
    .map((entry) => entry.row);
  const hours = data.callStats.hourly.filter(
    (entry) => entry.hour >= 6 && entry.hour <= 20,
  );
  const peak = Math.max(1, ...hours.map((entry) => entry.calls));
  const triage = [
    ...open
      .filter((row) => row.assignedTo === null)
      .map((row) => ({
        id: row.id,
        reference: row.number,
        subject: row.subject,
        priority: capitalise(row.priority),
        created: row.createdAt,
      })),
    ...data.escalations
      .filter((row) => row.status === "pending")
      .map((row) => ({
        id: row.id,
        reference: row.reference,
        subject: row.subject,
        priority: capitalise(row.priority),
        created: row.createdAt,
      })),
  ]
    .sort((a, b) => b.created.getTime() - a.created.getTime())
    .slice(0, 6);
  return {
    stats: [
      {
        label: "Inbox unread",
        value: data.threads.filter((row) => row.status === "unread").length,
        hint: "Threads waiting to be read",
      },
      {
        label: "Open tickets",
        value: open.length,
        hint: "Not yet resolved or closed",
      },
      {
        label: "SLA at risk",
        value: atRisk.length,
        hint: "Breached or due within 4 hours",
      },
      {
        label: "Agents online",
        value: data.agents.filter((row) => row.presence !== "offline").length,
        hint: "Available, busy or away",
      },
      {
        label: "Calls today",
        value: data.callStats.callsToday,
        hint: "Started since midnight UTC",
      },
    ],
    panels: [
      {
        kind: "meters" as const,
        title: "Hourly call volume",
        description: "Calls started per hour, 06:00 to 20:00 UTC.",
        gap: "charts" as const,
        meters: hours.map((entry) => ({
          label: `${String(entry.hour).padStart(2, "0")}:00`,
          value: entry.calls,
          max: peak,
          display: String(entry.calls),
        })),
      },
      {
        kind: "table" as const,
        title: "SLA watch",
        description: "Open tickets closest to their SLA deadline.",
        columns: [
          { key: "number", header: "Number", format: "link" as const },
          { key: "subject", header: "Subject", format: "text" as const },
          {
            key: "priority",
            header: "Priority",
            format: "badge" as const,
            accessor: (row: Record<string, unknown>) =>
              capitalise(String(row.priority)),
          },
          { key: "slaDueAt", header: "SLA due", format: "datetime" as const },
        ],
        rows: watch,
      },
      {
        kind: "list" as const,
        title: "Agent status",
        description: "Presence and workload per agent.",
        items: data.agents.map((agent) => ({
          label: agent.name,
          value: capitalise(agent.presence),
          hint: `${agent.openTickets} open`,
        })),
      },
      {
        kind: "table" as const,
        title: "Triage queue",
        description:
          "Unassigned tickets and pending escalations, newest first.",
        columns: [
          { key: "reference", header: "Reference", format: "link" as const },
          { key: "subject", header: "Subject", format: "text" as const },
          { key: "priority", header: "Priority", format: "badge" as const },
          { key: "created", header: "Created", format: "datetime" as const },
        ],
        rows: triage,
      },
    ],
  };
};

export const supportSpecs: ModuleSpecs = {
  items: {
    inbox: inboxSpec,
    tickets: ticketsSpec,
    "agent-desk": agentDeskSpec,
  },
  dashboard,
};
