import {
  Archive,
  ArrowRightLeft,
  Check,
  CheckCheck,
  Code,
  ExternalLink,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Settings,
  X,
} from "lucide-react";
import {
  type AiSurface,
  type AiUsageSurface,
  type EnterpriseAccessRequest,
  type EnterpriseAgingBucket,
  type EnterpriseAiAgent,
  type EnterpriseAiUsage,
  type EnterpriseNotification,
  type EnterprisePaymentMethod,
  type EnterpriseRevenueMonth,
  type EnterpriseSearchResult,
  type EnterpriseSpendLimit,
  type EnterpriseUsageMonth,
  type EnterpriseWorkflow,
  enterpriseData,
  type NotificationSeverity,
  type SearchGroup,
  type WorkflowStatus,
} from "../mock/enterprise.js";
import { financeData } from "../mock/finance.js";
import { ANCHOR } from "../mock/random.js";
import {
  type AnyList,
  capitalise,
  compactMoney,
  DAY,
  empty,
  includes,
  lead,
  searchBy,
  statusChips,
} from "./common.js";
import type { SupportTicket, TicketStatus } from "../mock/support.js";
import type {
  ListSpec,
  ModuleSpecs,
  Persona,
  Row,
  SegmentSpec,
  SelectFilterSpec,
} from "./types.js";

const filtered = "Try adjusting your search or filter criteria.";

/* ---------------------------------------------------------------- Inbox */

const severities: NotificationSeverity[] = [
  "info",
  "success",
  "warning",
  "error",
];

const notificationsSegment: SegmentSpec<EnterpriseNotification> = {
  key: "notifications",
  label: "Notifications",
  rows: (persona) => enterpriseData(persona).notifications,
  total: (persona) => enterpriseData(persona).totals.notifications,
  columns: [
    {
      key: "severity",
      header: "Severity",
      format: "status",
      accessor: (row) => capitalise(row.severity),
      sortable: false,
    },
    {
      key: "title",
      header: "Title",
      format: "party",
      accessor: (row) => ({
        name: row.title,
        ...(row.body ? { subline: row.body } : {}),
      }),
      sortable: false,
    },
    {
      key: "entity",
      header: "Entity",
      format: "badge",
      accessor: (row) => capitalise(row.entity),
      sortable: false,
    },
    { key: "createdAt", header: "Time", format: "datetime", sortable: true },
    { key: "read", header: "Read", format: "boolean", sortable: false },
  ],
  chips: [
    {
      key: "unread",
      label: "Unread",
      predicate: (row) => !row.read,
    },
    { key: "read", label: "Read", predicate: (row) => row.read },
  ],
  selects: [
    {
      key: "severity",
      label: "severities",
      options: severities.map((severity) => ({
        value: severity,
        label: capitalise(severity),
        predicate: (row: EnterpriseNotification) => row.severity === severity,
      })),
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Mark read", icon: Check },
  ],
  empty: empty("No new notifications", "You are all caught up."),
};

const ticketGroups: { key: string; label: string; statuses: TicketStatus[] }[] =
  [
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
    {
      key: "resolved",
      label: "Resolved",
      statuses: ["resolved", "confirmed"],
    },
    { key: "closed", label: "Closed", statuses: ["closed"] },
  ];

const slaState = (row: SupportTicket) => {
  if (row.slaDueAt === null) return "None";
  if (["resolved", "confirmed", "closed"].includes(row.status)) return "Met";
  return row.slaBreached ? "Breached" : "On track";
};

const myTicketsSegment: SegmentSpec<SupportTicket> = {
  key: "my-tickets",
  label: (t) => `My ${t.tickets.toLowerCase()}`,
  rows: (persona) => enterpriseData(persona).myTickets,
  total: (persona) => enterpriseData(persona).totals.myTickets,
  columns: [
    { key: "number", header: "Number", format: "link", sortable: false },
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
      sortable: false,
    },
    {
      key: "sla",
      header: "SLA",
      format: "badge",
      accessor: slaState,
      sortable: false,
    },
    {
      key: "updatedAt",
      header: "Updated",
      format: "datetime",
      sortable: false,
    },
  ],
  chips: ticketGroups.map((group) => ({
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
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Change status", icon: ArrowRightLeft },
  ],
  empty: {
    title: (t) => `No ${t.tickets.toLowerCase()} found`,
    description: filtered,
  },
};

const accessRequestsSegment: SegmentSpec<EnterpriseAccessRequest> = {
  key: "access-requests",
  label: "Access requests",
  rows: (persona) => enterpriseData(persona).accessRequests,
  total: (persona) => enterpriseData(persona).totals.accessRequests,
  columns: [
    {
      key: "name",
      header: "Name",
      format: "party",
      accessor: (row) => ({ name: row.name, subline: row.email }),
      sortable: false,
    },
    { key: "domain", header: "Domain", format: "text", sortable: false },
    {
      key: "requestedAt",
      header: "Requested",
      format: "datetime",
      sortable: false,
    },
  ],
  pageActions: [],
  chips: [],
  selects: [],
  rowActions: [
    { label: "Approve", icon: Check },
    { label: "Decline", icon: X, variant: "destructive" },
  ],
  empty: empty("No access requests", "Nobody is waiting for approval."),
};

const inboxSpec: AnyList = {
  key: "inbox",
  title: "Inbox",
  description: "Notifications, your tickets and access requests in one queue.",
  ...lead(notificationsSegment),
  segments: [notificationsSegment, myTicketsSegment, accessRequestsSegment],
  pageActions: [{ label: "Mark all read", icon: CheckCheck }],
  search: searchBy(
    "title",
    "body",
    "number",
    "subject",
    "name",
    "email",
    "domain",
  ),
  empty: empty("No new notifications", filtered),
};

/* --------------------------------------------------------------- Search */

const searchGroups: SearchGroup[] = [
  "Persons",
  "Organizations",
  "Tickets",
  "Invoices",
  "Payments",
  "Quotes",
  "Subscriptions",
  "Applications",
];

const searchSpec: ListSpec<EnterpriseSearchResult> = {
  key: "search",
  title: "Search",
  description: "Find people, organizations, tickets, invoices and more.",
  rows: (persona) => enterpriseData(persona).searchResults,
  selectable: false,
  columns: [
    {
      key: "group",
      header: "Group",
      format: "badge",
      sortable: false,
    },
    { key: "title", header: "Title", format: "link", sortable: false },
    { key: "subtitle", header: "Subtitle", format: "text", sortable: false },
  ],
  chips: [],
  selects: [
    {
      key: "group",
      label: "groups",
      options: searchGroups.map((group) => ({
        value: group,
        label: group,
        predicate: (row: EnterpriseSearchResult) => row.group === group,
      })),
    },
  ],
  rowActions: [{ label: "Open", icon: ExternalLink }],
  pageActions: [],
  search: (row, query) =>
    includes(row.title, query) || includes(row.subtitle, query),
  empty: empty("Type to search", "Results appear as you type."),
};

/* ------------------------------------------------------------ Analytics */

/**
 * The Range presets are inert: every option keeps every row, because the
 * mock series are fixed. They exist so the control is present.
 */
const rangeSelect = <R extends Row>(): SelectFilterSpec<R> => ({
  key: "range",
  label: "ranges",
  options: [
    { value: "7d", label: "7 days", predicate: () => true },
    { value: "30d", label: "30 days", predicate: () => true },
    { value: "90d", label: "90 days", predicate: () => true },
    { value: "12m", label: "12 months", predicate: () => true },
  ],
});

const monthLabel = (month: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(month);

const newestFirst = <R extends { month: Date }>(rows: R[]) =>
  [...rows].sort((a, b) => b.month.getTime() - a.month.getTime());

const revenueSegment: SegmentSpec<EnterpriseRevenueMonth> = {
  key: "revenue",
  label: "Revenue",
  rows: (persona) =>
    newestFirst(enterpriseData(persona).analytics.revenueByMonth).slice(0, 6),
  gaps: ["charts"],
  columns: [
    {
      key: "month",
      header: "Month",
      format: "text",
      accessor: (row) => monthLabel(row.month),
      sortable: false,
    },
    {
      key: "invoiced",
      header: "Invoiced",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "collected",
      header: "Collected",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "collectionRate",
      header: "Collection rate",
      format: "percent",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [rangeSelect<EnterpriseRevenueMonth>()],
  rowActions: [],
  empty: empty(
    "No data yet",
    "This chart will populate once data is available.",
  ),
};

const paymentsSegment: SegmentSpec<EnterprisePaymentMethod> = {
  key: "payments",
  label: "Payments",
  rows: (persona) => enterpriseData(persona).analytics.paymentsByMethod,
  gaps: ["charts"],
  columns: [
    {
      key: "method",
      header: "Method",
      format: "badge",
      accessor: (row) => capitalise(row.method),
      sortable: false,
    },
    {
      key: "count",
      header: "Count",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "amount",
      header: "Amount",
      format: "money",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [rangeSelect<EnterprisePaymentMethod>()],
  rowActions: [],
  empty: empty(
    "No data yet",
    "This chart will populate once data is available.",
  ),
};

const agingSegment: SegmentSpec<EnterpriseAgingBucket> = {
  key: "aging",
  label: "Aging",
  rows: (persona) => enterpriseData(persona).analytics.aging,
  gaps: ["charts"],
  columns: [
    { key: "bucket", header: "Bucket", format: "text", sortable: false },
    {
      key: "count",
      header: "Count",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "amount",
      header: "Amount",
      format: "money",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [rangeSelect<EnterpriseAgingBucket>()],
  rowActions: [],
  empty: empty(
    "No data yet",
    "This chart will populate once data is available.",
  ),
};

const usageSegment: SegmentSpec<EnterpriseUsageMonth> = {
  key: "usage",
  label: "Usage",
  rows: (persona) => newestFirst(enterpriseData(persona).analytics.usage),
  gaps: ["charts"],
  columns: [
    {
      key: "month",
      header: "Month",
      format: "text",
      accessor: (row) => monthLabel(row.month),
      sortable: false,
    },
    { key: "measure", header: "Measure", format: "text", sortable: false },
    {
      key: "value",
      header: "Value",
      format: "count",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [rangeSelect<EnterpriseUsageMonth>()],
  rowActions: [],
  empty: empty(
    "No data yet",
    "This chart will populate once data is available.",
  ),
};

const analyticsSpec: AnyList = {
  key: "analytics",
  title: "Analytics",
  description: "Revenue, payments, receivables aging and usage at a glance.",
  ...lead(revenueSegment),
  gaps: [],
  segments: [revenueSegment, paymentsSegment, agingSegment, usageSegment],
  pageActions: [],
  search: (row, query) =>
    searchBy("method", "bucket", "measure")(row, query) ||
    (row.month instanceof Date && includes(monthLabel(row.month), query)),
  empty: empty(
    "No data yet",
    "This chart will populate once data is available.",
  ),
  selectable: false,
};

/* ------------------------------------------------------------ Workflows */

const workflowStatuses: WorkflowStatus[] = [
  "active",
  "draft",
  "paused",
  "archived",
];

const workflowsSpec: ListSpec<EnterpriseWorkflow> = {
  key: "workflows",
  title: "Workflows",
  description: "Automations that run across every module.",
  rows: (persona) => enterpriseData(persona).workflows,
  total: (persona) => enterpriseData(persona).totals.workflows,
  selectable: false,
  columns: [
    { key: "name", header: "Name", format: "link", sortable: false },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
    {
      key: "trigger",
      header: "Trigger",
      format: "badge",
      accessor: (row) => capitalise(row.trigger),
      sortable: false,
    },
    {
      key: "executions",
      header: "Executions",
      format: "count",
      align: "end",
      sortable: true,
    },
    { key: "lastRun", header: "Last run", format: "datetime", sortable: true },
    {
      key: "successRate",
      header: "Success rate",
      format: "percent",
      align: "end",
      sortable: false,
    },
  ],
  chips: statusChips<EnterpriseWorkflow>(workflowStatuses),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Run", icon: Play },
    { label: "Pause", icon: Pause },
    { label: "Archive", icon: Archive },
  ],
  pageActions: [{ label: "New workflow", icon: Plus, gap: "flow-builder" }],
  search: (row, query) => includes(row.name, query),
  empty: empty("No workflows found", filtered),
};

/* ------------------------------------------------------------ AI agents */

const surfaceLabels: Record<AiUsageSurface, string> = {
  jareis_chat: "JAREIS chat",
  media_generation: "Media generation",
  agent_command: "Agent commands",
};

const usageSurfaces = Object.keys(surfaceLabels) as AiUsageSurface[];

const agentSurfaceLabel = (surface: AiSurface) => capitalise(surface);

const agentsSegment: SegmentSpec<EnterpriseAiAgent> = {
  key: "agents",
  label: "Agents",
  rows: (persona) => enterpriseData(persona).aiAgents,
  columns: [
    {
      key: "surface",
      header: "Surface",
      format: "badge",
      accessor: (row) => agentSurfaceLabel(row.surface),
      sortable: false,
    },
    { key: "enabled", header: "Enabled", format: "boolean", sortable: false },
    { key: "persona", header: "Persona", format: "text", sortable: false },
    { key: "model", header: "Model", format: "text", sortable: false },
    {
      key: "updatedAt",
      header: "Updated",
      format: "datetime",
      sortable: false,
    },
  ],
  chips: [],
  selects: [],
  rowActions: [{ label: "Configure", icon: Settings }],
  empty: empty("No agents found", filtered),
};

const usageTeamSegment: SegmentSpec<EnterpriseAiUsage> = {
  key: "usage",
  label: "Usage",
  rows: (persona) => enterpriseData(persona).aiUsage,
  columns: [
    {
      key: "team",
      header: "Team",
      format: "party",
      accessor: (row) => ({ name: row.team, subline: capitalise(row.level) }),
      sortable: false,
    },
    {
      key: "surface",
      header: "Surface",
      format: "badge",
      accessor: (row) => surfaceLabels[row.surface],
      sortable: false,
    },
    {
      key: "spent",
      header: "Spent",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "budget",
      header: "Budget",
      format: "money",
      accessor: (row) => (row.budget === 0 ? null : row.budget),
      align: "end",
      sortable: false,
    },
    {
      key: "policy",
      header: "Policy",
      format: "badge",
      accessor: (row) => capitalise(row.policy),
      sortable: false,
    },
    { key: "periodEnd", header: "Period end", format: "date", sortable: false },
  ],
  chips: usageSurfaces.map((surface) => ({
    key: surface,
    label: surfaceLabels[surface],
    predicate: (row: EnterpriseAiUsage) => row.surface === surface,
  })),
  selects: [],
  rowActions: [{ label: "Open", icon: ExternalLink }],
  empty: empty("No usage found", filtered),
};

const spendLimitsSegment: SegmentSpec<EnterpriseSpendLimit> = {
  key: "spend-limits",
  label: "Spend limits",
  rows: (persona) => enterpriseData(persona).spendLimits,
  columns: [
    { key: "scope", header: "Scope", format: "text", sortable: false },
    {
      key: "limit",
      header: "Limit",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "used",
      header: "Used",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "period",
      header: "Period",
      format: "badge",
      accessor: (row) => capitalise(row.period),
      sortable: false,
    },
    {
      key: "policy",
      header: "Policy",
      format: "badge",
      accessor: (row) => capitalise(row.policy),
      sortable: false,
    },
    {
      key: "alertAt",
      header: "Alert at",
      format: "percent",
      align: "end",
      sortable: false,
    },
  ],
  chips: [],
  selects: [],
  rowActions: [{ label: "Edit", icon: Pencil }],
  empty: empty(
    "No organizations",
    "Create an org to start setting AI spend limits.",
  ),
};

const aiAgentsSpec: AnyList = {
  key: "ai-agents",
  title: "AI agents",
  description: "Agent surfaces, what they spend and the limits around them.",
  ...lead(agentsSegment),
  segments: [agentsSegment, usageTeamSegment, spendLimitsSegment],
  pageActions: [
    {
      label: "Embed snippet",
      icon: Code,
      variant: "outline",
      gap: "code-block",
    },
    { label: "Save", icon: Save },
  ],
  search: searchBy("persona", "model", "team", "scope", "surface"),
  empty: empty("No agents found", filtered),
  selectable: false,
};

/* ------------------------------------------------------------ Dashboard */

const HOUR = 3_600_000;

/** Matches the Finance dashboard's open-invoice set. */
const closedInvoice = new Set(["draft", "paid", "void", "written_off"]);

const dashboard = (persona: Persona) => {
  const data = enterpriseData(persona);
  const now = ANCHOR.getTime();
  const unread = data.notifications.filter((row) => !row.read);
  const closedLike = new Set<TicketStatus>(["resolved", "confirmed", "closed"]);
  const openTickets = data.myTickets.filter(
    (row) => !closedLike.has(row.status),
  );
  const due = financeData(persona).invoices.filter(
    (row) =>
      !closedInvoice.has(row.status) &&
      row.balance > 0 &&
      row.dueDate.getTime() >= now &&
      row.dueDate.getTime() <= now + 7 * DAY,
  );
  const running = data.workflowRuns.filter((row) => row.status === "running");
  const failedOvernight = data.workflowRuns.filter(
    (row) =>
      row.status === "failed" && now - row.startedAt.getTime() <= 24 * HOUR,
  );
  const latestRevenue = newestFirst(data.analytics.revenueByMonth)[0];
  const newestUnread = [...unread]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);
  const newestRuns = [...data.workflowRuns]
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 6);
  return {
    stats: [
      {
        label: "Inbox unread",
        value: unread.length,
        hint: `${unread.filter((row) => row.severity === "error").length} errors`,
      },
      {
        label: "My open tickets",
        value: openTickets.length,
        hint: `${openTickets.filter((row) => row.slaBreached).length} SLA at risk`,
      },
      {
        label: "Due this week",
        value: compactMoney(due.reduce((sum, row) => sum + row.balance, 0)),
        hint: `${due.length} invoices`,
      },
      {
        label: "Workflows running",
        value: running.length,
        hint: `${failedOvernight.length} failed overnight`,
      },
    ],
    panels: [
      {
        kind: "table" as const,
        title: "My inbox",
        description: "Newest unread notifications.",
        columns: [
          {
            key: "severity",
            header: "Severity",
            format: "status" as const,
            accessor: (row: Row) => capitalise(String(row.severity)),
          },
          { key: "title", header: "Title", format: "text" as const },
          {
            key: "entity",
            header: "Entity",
            format: "badge" as const,
            accessor: (row: Row) => capitalise(String(row.entity)),
          },
          { key: "createdAt", header: "Time", format: "datetime" as const },
        ],
        rows: newestUnread,
      },
      {
        kind: "table" as const,
        title: "Workflow runs",
        description: "The latest runs across every workflow.",
        columns: [
          { key: "workflow", header: "Workflow", format: "text" as const },
          {
            key: "status",
            header: "Status",
            format: "status" as const,
            accessor: (row: Row) => capitalise(String(row.status)),
          },
          { key: "startedAt", header: "Started", format: "datetime" as const },
          {
            key: "durationSeconds",
            header: "Duration",
            format: "duration" as const,
            accessor: (row: Row) => Number(row.durationSeconds) / 60,
          },
        ],
        rows: newestRuns,
      },
      {
        kind: "list" as const,
        title: "Analytics highlights",
        description: "Revenue and AI spend this period.",
        items: [
          {
            label: "Latest month invoiced",
            value: compactMoney(latestRevenue?.invoiced ?? 0),
            ...(latestRevenue ? { hint: monthLabel(latestRevenue.month) } : {}),
          },
          {
            label: "Collection rate",
            value: `${(latestRevenue?.collectionRate ?? 0).toFixed(1)}%`,
          },
          {
            label: "AI spend vs budget",
            value: `${compactMoney(data.aiSummary.spent)} of ${compactMoney(data.aiSummary.budget)}`,
          },
          {
            label: "Top surface",
            value: surfaceLabels[data.aiSummary.topSurface],
          },
        ],
      },
    ],
  };
};

export const enterpriseSpecs: ModuleSpecs = {
  items: {
    inbox: inboxSpec,
    search: searchSpec,
    analytics: analyticsSpec,
    workflows: workflowsSpec,
    "ai-agents": aiAgentsSpec,
  },
  dashboard,
};
