import { engageData } from "./engage.js";
import {
  byDateAsc,
  DAY_MS,
  numberRange,
  plusDays,
  round2,
  weights,
} from "./finance/common.js";
import { financeData } from "./finance.js";
import {
  agentNames,
  emailFor,
  organizationsByIndustry,
  personName,
} from "./names.js";
import { networkData } from "./network.js";
import { ANCHOR, createRng, seedFor } from "./random.js";
import { salesData } from "./sales.js";
import {
  AGING_BUCKETS,
  accessRequestsShape,
  aiAgentSettingsShape,
  aiBudgetsShape,
  aiUsageShape,
  dailyUsageShape,
  ENTERPRISE_COUNTS,
  myTicketsShape,
  notificationsShape,
  searchShape,
  UNREAD_SHARE,
  usageMeasure,
  workflowRunsShape,
  workflowsShape,
} from "./shapes/enterprise.js";
import { type SupportTicket, supportData } from "./support.js";
import type { Persona, PersonaKey, Row } from "../specs/types.js";

export type NotificationSeverity = "info" | "success" | "warning" | "error";
export type NotificationEntity =
  | "ticket"
  | "network_exchange"
  | "network_partner"
  | "sync_run"
  | "ap"
  | "subscription"
  | "appointment"
  | "organization"
  | "workspace"
  | "automation_ownership"
  | "calendar_connection";
export type SearchGroup =
  | "Persons"
  | "Organizations"
  | "Tickets"
  | "Invoices"
  | "Payments"
  | "Quotes"
  | "Subscriptions"
  | "Applications";
export type WorkflowStatus = "active" | "draft" | "paused" | "archived";
export type WorkflowTrigger =
  | "manual"
  | "event"
  | "schedule"
  | "api"
  | "condition";
export type WorkflowRunStatus = "succeeded" | "failed" | "running";
export type AiSurface =
  | "chat"
  | "radar_dashboard"
  | "voice"
  | "command_console";
export type AiUsageSurface =
  | "jareis_chat"
  | "media_generation"
  | "agent_command";
export type AiPolicy = "soft" | "hard" | "none";

export type EnterpriseNotification = Row & {
  severity: NotificationSeverity;
  /** True on the synthetic success rows (QA has none). */
  severitySynthetic: boolean;
  entity: NotificationEntity;
  /** QA notification type, e.g. `ticket.sla_breached`. */
  type: string;
  title: string;
  /** Null on about 10% of rows, as in QA. */
  body: string | null;
  /** Newest first, within the last 14 days. */
  createdAt: Date;
  read: boolean;
  /** Route-like string; null for entities with no target (ticket, appointment, org, workspace, automation_ownership). */
  target: string | null;
};

export type EnterpriseAccessRequest = Row & {
  name: string;
  email: string;
  requestedAt: Date;
  domain: string;
};

export type EnterpriseSearchResult = Row & {
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
};

export type EnterpriseRevenueMonth = Row & {
  /** First day of the month (UTC). */
  month: Date;
  invoiced: number;
  collected: number;
  /** Percent, one decimal. */
  collectionRate: number;
};

export type EnterprisePaymentMethod = Row & {
  method: string;
  count: number;
  amount: number;
};

export type EnterpriseAgingBucket = Row & {
  bucket: string;
  amount: number;
  count: number;
};

export type EnterpriseUsageMonth = Row & {
  month: Date;
  /** Persona measure label, e.g. "Energy delivered (kWh)". */
  measure: string;
  value: number;
};

export type EnterpriseWorkflow = Row & {
  name: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  executions: number;
  /** Null when the workflow has never run. */
  lastRun: Date | null;
  /** Percent 0-100; 0 when it never ran. */
  successRate: number;
  createdAt: Date;
};

export type EnterpriseWorkflowRun = Row & {
  /** A workflow name. */
  workflow: string;
  workflowId: string;
  status: WorkflowRunStatus;
  startedAt: Date;
  durationSeconds: number;
  steps: number;
};

export type EnterpriseAiAgent = Row & {
  surface: AiSurface;
  enabled: boolean;
  persona: string;
  model: string;
  updatedAt: Date;
};

export type EnterpriseAiUsage = Row & {
  team: string;
  level: "team" | "workspace";
  spent: number;
  /** 0 when the policy is "none" (no cap). */
  budget: number;
  policy: AiPolicy;
  surface: AiUsageSurface;
  /** End of the billing month, after the anchor. */
  periodEnd: Date;
};

export type EnterpriseAiSummary = {
  spent: number;
  budget: number;
  projectedMonthEnd: number;
  topSurface: AiUsageSurface;
};

export type EnterpriseSpendLimit = Row & {
  /** "Tenant", "Team: ...", "Workspace: ..." or "User: ...". */
  scope: string;
  limit: number;
  used: number;
  period: "monthly" | "daily";
  policy: AiPolicy;
  /** Percent of the limit at which an alert fires. */
  alertAt: number;
};

export type EnterpriseRowSet =
  | "notifications"
  | "accessRequests"
  | "myTickets"
  | "searchResults"
  | "workflows"
  | "workflowRuns"
  | "aiAgents"
  | "aiUsage"
  | "spendLimits";

export type EnterpriseData = {
  notifications: EnterpriseNotification[];
  accessRequests: EnterpriseAccessRequest[];
  /** The viewer's tickets, filtered from `supportData(persona).tickets` (same references). */
  myTickets: SupportTicket[];
  searchResults: EnterpriseSearchResult[];
  analytics: {
    revenueByMonth: EnterpriseRevenueMonth[];
    paymentsByMethod: EnterprisePaymentMethod[];
    aging: EnterpriseAgingBucket[];
    usage: EnterpriseUsageMonth[];
  };
  workflows: EnterpriseWorkflow[];
  workflowRuns: EnterpriseWorkflowRun[];
  aiAgents: EnterpriseAiAgent[];
  aiUsage: EnterpriseAiUsage[];
  aiSummary: EnterpriseAiSummary;
  spendLimits: EnterpriseSpendLimit[];
  /** The viewer (the Support viewer name). */
  viewer: string;
  totals: Record<EnterpriseRowSet, number>;
};

const NOTIFICATION_TENANT: Record<PersonaKey, "U1" | "F1" | "G1"> = {
  utilities: "U1",
  financial: "F1",
  government_federal: "G1",
};

const DIGEST_ENTITIES = ["workspace", "organization", "subscription"] as const;

const severityFor = (type: string): NotificationSeverity => {
  if (type === "ticket.sla_breached" || type === "exchange.failed") {
    return "error";
  }
  if (type === "partner.revoked" || type === "automation.ownerless") {
    return "warning";
  }
  // QA has no success rows: bookings are the flagged synthetic share.
  if (type === "appointment.booked") return "success";
  return "info";
};

const entityFor = (type: string, i: number): NotificationEntity => {
  if (type.startsWith("ticket.")) return "ticket";
  if (type.startsWith("exchange.")) return "network_exchange";
  if (type.startsWith("appointment.")) return "appointment";
  if (type.startsWith("partner.")) return "network_partner";
  if (type.startsWith("automation.")) return "automation_ownership";
  return DIGEST_ENTITIES[i % DIGEST_ENTITIES.length] as NotificationEntity;
};

const genNotifications = (
  persona: Persona,
  tickets: SupportTicket[],
  exchangeIds: string[],
): EnterpriseNotification[] => {
  const rng = createRng(seedFor(persona, "enterprise.notifications"));
  const tenant = NOTIFICATION_TENANT[persona.key];
  const typeWeights = weights<string>(
    notificationsShape.enums,
    `type_${tenant}`,
  );
  const window = notificationsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const rows = Array.from(
    { length: ENTERPRISE_COUNTS.notifications },
    (_, i) => {
      const type = rng.weighted(typeWeights);
      const entity = entityFor(type, i);
      const ticket = tickets.length ? rng.pick(tickets) : null;
      const partner = rng.pick(organizationsByIndustry[persona.key]);
      const pct = rng.pick([50, 80, 100]);
      let title = "";
      let body: string | null = null;
      let target: string | null = null;
      switch (type) {
        case "ticket.sla_breached":
          title = `SLA breached on ${ticket?.number ?? "a ticket"}`;
          body = ticket
            ? `${ticket.subject} passed its response target.`
            : "A ticket passed its response target.";
          break;
        case "ai_usage.digest":
          title = `AI usage reached ${pct}% of the monthly budget`;
          body = rng.bool(0.15)
            ? null
            : `Spend so far this month is at ${pct}% of the configured cap.`;
          target = entity === "subscription" ? "/settings/billing" : null;
          break;
        case "exchange.awaiting_review":
          title = `Document from ${partner} awaits review`;
          body = "Open the exchange to approve or reject it.";
          target = `/network/exchanges/${rng.pick(exchangeIds)}`;
          break;
        case "exchange.failed":
          title = `Exchange with ${partner} failed`;
          body = rng.bool(0.1)
            ? null
            : "Delivery was rejected by the partner endpoint.";
          target = `/network/exchanges/${rng.pick(exchangeIds)}`;
          break;
        case "appointment.booked":
          title = "New appointment booked";
          body = "A customer booked a slot from the scheduling page.";
          break;
        case "appointment.cancelled":
          title = "Appointment cancelled";
          body = rng.bool(0.1) ? null : "The slot is free again.";
          break;
        case "automation.ownerless":
          title = "A workflow has no owner";
          body = "Assign an owner so failures reach someone.";
          break;
        case "partner.revoked":
          title = `${partner} revoked the connection`;
          body = "Exchanges with this partner are paused.";
          target = "/network/partners";
          break;
        default:
          title = `${partner} invited you to connect`;
          body = "Accept the invitation to start exchanging documents.";
          target = "/network/partners";
      }
      const severity = severityFor(type);
      return {
        id: "",
        severity,
        severitySynthetic: severity === "success",
        entity,
        type,
        title,
        body,
        createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
        read: !rng.bool(UNREAD_SHARE),
        target,
      } satisfies EnterpriseNotification;
    },
  );
  return byDateAsc(rows, (r) => r.createdAt)
    .reverse()
    .map((r, i) => ({ ...r, id: `notification-${i + 1}` }));
};

const genAccessRequests = (persona: Persona): EnterpriseAccessRequest[] => {
  const rng = createRng(seedFor(persona, "enterprise.accessRequests"));
  const window = accessRequestsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const rows = Array.from({ length: ENTERPRISE_COUNTS.accessRequests }, () => {
    const name = personName(rng);
    const email = emailFor(
      name,
      rng.pick(organizationsByIndustry[persona.key]),
    );
    return {
      name,
      email,
      requestedAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      domain: email.split("@")[1] as string,
    };
  });
  return byDateAsc(rows, (r) => r.requestedAt)
    .reverse()
    .map((r, i) => ({ ...r, id: `access-request-${i + 1}` }));
};

const PER_GROUP = ENTERPRISE_COUNTS.searchResults / 8;

const genSearchResults = (persona: Persona): EnterpriseSearchResult[] => {
  const rng = createRng(seedFor(persona, "enterprise.searchResults"));
  const network = networkData(persona);
  const finance = financeData(persona);
  const sales = salesData(persona);
  const support = supportData(persona);
  const engage = engageData(persona);
  const take = <T>(items: readonly T[]): T[] =>
    rng.shuffle(items).slice(0, PER_GROUP);
  const groups: [SearchGroup, EnterpriseSearchResult[]][] = [
    [
      "Persons",
      take(network.contacts).map((c) => ({
        id: "",
        group: "Persons" as const,
        title: c.name,
        subtitle: c.email,
        href: `/network/contacts/${c.id}`,
      })),
    ],
    [
      "Organizations",
      take(network.organizations).map((o) => ({
        id: "",
        group: "Organizations" as const,
        title: o.name,
        subtitle: o.industry,
        href: `/network/organizations/${o.id}`,
      })),
    ],
    [
      "Tickets",
      take(support.tickets).map((t) => ({
        id: "",
        group: "Tickets" as const,
        title: `${t.number} ${t.subject}`,
        subtitle: `${t.status.replace(/_/g, " ")} - ${t.customer}`,
        href: `/support/tickets/${t.id}`,
      })),
    ],
    [
      "Invoices",
      take(finance.invoices).map((inv) => ({
        id: "",
        group: "Invoices" as const,
        title: inv.number,
        subtitle: `${inv.status.replace(/_/g, " ")} - ${inv.customer}`,
        href: `/finance/invoices/${inv.id}`,
      })),
    ],
    [
      "Payments",
      take(finance.payments).map((p) => ({
        id: "",
        group: "Payments" as const,
        title: p.reference || p.document,
        subtitle: `${p.status} - ${p.party}`,
        href: `/finance/payments/${p.id}`,
      })),
    ],
    [
      "Quotes",
      take(sales.quotes).map((q) => ({
        id: "",
        group: "Quotes" as const,
        title: q.number,
        subtitle: `${q.status} - ${q.name}`,
        href: `/sales/quotes/${q.id}`,
      })),
    ],
    [
      "Subscriptions",
      take(finance.subscriptions).map((s) => ({
        id: "",
        group: "Subscriptions" as const,
        title: s.number,
        subtitle: `${s.status.replace(/_/g, " ")} - ${s.customer}`,
        href: `/finance/subscriptions/${s.id}`,
      })),
    ],
    [
      "Applications",
      take(engage.forms).map((f) => ({
        id: "",
        group: "Applications" as const,
        title: f.name,
        subtitle: `${f.status} - ${f.type}`,
        href: `/engage/applications/${f.id}`,
      })),
    ],
  ];
  return groups
    .flatMap(([, rows]) => rows)
    .map((r, i) => ({ ...r, id: `search-${i + 1}` }));
};

const monthStart = (monthsBack: number): Date =>
  new Date(
    Date.UTC(ANCHOR.getUTCFullYear(), ANCHOR.getUTCMonth() - monthsBack, 1),
  );

const genRevenue = (persona: Persona): EnterpriseRevenueMonth[] => {
  const invoices = financeData(persona).invoices;
  const first = monthStart(ENTERPRISE_COUNTS.months - 1).getTime();
  return Array.from({ length: ENTERPRISE_COUNTS.months }, (_, i) => {
    const monthsBack = ENTERPRISE_COUNTS.months - 1 - i;
    const start = monthStart(monthsBack);
    const end = monthStart(monthsBack - 1).getTime();
    let invoiced = 0;
    let collected = 0;
    for (const inv of invoices) {
      const t = inv.issueDate.getTime();
      if (t < first || t < start.getTime() || t >= end) continue;
      invoiced += inv.total;
      collected += inv.total - inv.balance;
    }
    invoiced = round2(invoiced);
    collected = round2(collected);
    return {
      id: `revenue-${i + 1}`,
      month: start,
      invoiced,
      collected,
      collectionRate: invoiced
        ? Math.round((collected / invoiced) * 1000) / 10
        : 0,
    };
  });
};

const genPaymentsByMethod = (persona: Persona): EnterprisePaymentMethod[] => {
  const byMethod = new Map<string, { count: number; amount: number }>();
  for (const p of financeData(persona).payments) {
    if (p.direction !== "in") continue;
    const entry = byMethod.get(p.method) ?? { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount = round2(entry.amount + p.amount);
    byMethod.set(p.method, entry);
  }
  return [...byMethod.entries()]
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([method, v]) => ({ id: `method-${method}`, method, ...v }));
};

const genAging = (persona: Persona): EnterpriseAgingBucket[] => {
  const buckets = AGING_BUCKETS.map((bucket, i) => ({
    id: `aging-${i + 1}`,
    bucket,
    amount: 0,
    count: 0,
  }));
  for (const inv of financeData(persona).invoices) {
    if (inv.balance <= 0 || inv.status === "draft" || inv.status === "void") {
      continue;
    }
    const daysPast = Math.floor(
      (ANCHOR.getTime() - inv.dueDate.getTime()) / DAY_MS,
    );
    const index =
      daysPast <= 0
        ? 0
        : daysPast <= 30
          ? 1
          : daysPast <= 60
            ? 2
            : daysPast <= 90
              ? 3
              : 4;
    const bucket = buckets[index];
    if (!bucket) continue;
    bucket.amount = round2(bucket.amount + inv.balance);
    bucket.count += 1;
  }
  return buckets;
};

const genUsage = (persona: Persona): EnterpriseUsageMonth[] => {
  const rng = createRng(seedFor(persona, "enterprise.analytics.usage"));
  const range = numberRange(dailyUsageShape, `value_${persona.key}`);
  return Array.from({ length: ENTERPRISE_COUNTS.months }, (_, i) => {
    const monthsBack = ENTERPRISE_COUNTS.months - 1 - i;
    const share = monthsBack === 0 ? ANCHOR.getUTCDate() / 30 : 1;
    return {
      id: `usage-${i + 1}`,
      month: monthStart(monthsBack),
      measure: usageMeasure[persona.key],
      value: Math.round(rng.range(range, 0) * share),
    };
  });
};

const WORKFLOW_STEMS: readonly string[] = [
  "Past-due reminder sequence",
  "Final notice escalation",
  "Welcome new customer",
  "Payment received confirmation",
  "Failed payment retry",
  "Quote follow-up",
  "Renewal outreach",
  "Dispute intake routing",
  "Ticket triage and assign",
  "SLA breach alert",
  "Application review hand-off",
  "Partner onboarding checklist",
  "Monthly statement delivery",
  "Collections propensity email",
  "Collections disconnect SMS",
  "Collections disconnect voice",
  "Final bill email",
  "Feedback survey after close",
  "Appointment reminder",
  "Inactive account win-back",
  "Document exchange approval",
  "Weekly digest to managers",
];
const WORKFLOW_VARIANTS: readonly string[] = ["Priority", "Pilot", "Weekly"];

const genWorkflows = (persona: Persona): EnterpriseWorkflow[] => {
  const rng = createRng(seedFor(persona, "enterprise.workflows"));
  const tenant = NOTIFICATION_TENANT[persona.key];
  const statusWeights = weights<WorkflowStatus>(
    workflowsShape.enums,
    `status_${tenant}`,
  );
  const triggerWeights = weights<WorkflowTrigger>(
    workflowsShape.enums,
    "trigger",
  );
  const window = workflowsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const execRange = numberRange(workflowsShape, "executions");
  const successRange = numberRange(workflowsShape, "success_rate");
  const stems = rng.shuffle(WORKFLOW_STEMS);
  return Array.from({ length: ENTERPRISE_COUNTS.workflows }, (_, i) => {
    const stem = stems[i % stems.length] as string;
    const name =
      i < stems.length
        ? stem
        : `${stem} - ${WORKFLOW_VARIANTS[(i - stems.length) % WORKFLOW_VARIANTS.length]}`;
    const status = rng.weighted(statusWeights);
    const createdAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const never =
      status === "draft" || (status === "archived" && rng.bool(0.3));
    const executions = never ? 0 : Math.round(rng.range(execRange, 0));
    const elapsed =
      Math.max(0, ANCHOR.getTime() - createdAt.getTime()) / DAY_MS;
    return {
      id: `workflow-${i + 1}`,
      name,
      status,
      trigger: rng.weighted(triggerWeights),
      executions,
      // Last run falls between creation and the anchor; paused and archived rows ran longer ago.
      lastRun:
        executions === 0
          ? null
          : plusDays(
              createdAt,
              elapsed *
                (status === "active"
                  ? 0.6 + rng.next() * 0.4
                  : rng.next() * 0.7),
              true,
            ),
      successRate:
        executions === 0 ? 0 : Math.round(rng.range(successRange, 1) * 10) / 10,
      createdAt,
    };
  });
};

const genWorkflowRuns = (
  persona: Persona,
  workflows: EnterpriseWorkflow[],
): EnterpriseWorkflowRun[] => {
  const rng = createRng(seedFor(persona, "enterprise.workflowRuns"));
  const pool = workflows.filter(
    (w) => w.executions > 0 && w.status !== "draft",
  );
  if (!pool.length) return [];
  const statusWeights = weights<WorkflowRunStatus>(
    workflowRunsShape.enums,
    "status",
  );
  const window = workflowRunsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const okRange = numberRange(workflowRunsShape, "duration_succeeded");
  const badRange = numberRange(workflowRunsShape, "duration_failed");
  const stepsRange = numberRange(workflowRunsShape, "steps");
  const rows = Array.from({ length: ENTERPRISE_COUNTS.workflowRuns }, () => {
    const workflow = rng.pick(pool);
    // A paused or archived workflow cannot be running.
    const drawn = rng.weighted(statusWeights);
    const status: WorkflowRunStatus =
      drawn === "running" && workflow.status !== "active" ? "succeeded" : drawn;
    const durationSeconds =
      status === "running"
        ? rng.int(30, 3 * 3600)
        : Math.round(rng.range(status === "failed" ? badRange : okRange, 0));
    // Start inside [createdAt, anchor - duration], so a run never ends after the anchor.
    const lo = workflow.createdAt.getTime();
    const hi = ANCHOR.getTime() - durationSeconds * 1000;
    let t =
      status === "running"
        ? hi
        : rng.daysAgo(window.fromDaysAgo, window.toDaysAgo).getTime();
    if (t > hi) t = hi;
    if (t < lo) t = lo + rng.next() * Math.max(0, hi - lo);
    return {
      id: "",
      workflow: workflow.name,
      workflowId: workflow.id,
      status,
      startedAt: new Date(t),
      durationSeconds,
      steps: Math.round(rng.range(stepsRange, 0)),
    } satisfies EnterpriseWorkflowRun;
  });
  return byDateAsc(rows, (r) => r.startedAt)
    .reverse()
    .map((r, i) => ({ ...r, id: `run-${i + 1}` }));
};

/** A workflow's last run is its newest run; workflows without a run row keep their drawn date. */
const withLastRuns = (
  workflows: EnterpriseWorkflow[],
  runs: EnterpriseWorkflowRun[],
): EnterpriseWorkflow[] => {
  const newest = new Map<string, Date>();
  for (const r of runs) {
    const seen = newest.get(r.workflowId);
    if (!seen || r.startedAt.getTime() > seen.getTime()) {
      newest.set(r.workflowId, r.startedAt);
    }
  }
  return workflows.map((w) => ({
    ...w,
    lastRun: newest.get(w.id) ?? w.lastRun,
  }));
};

const SURFACE_MODELS: Record<AiSurface, string> = {
  chat: "assistant-standard",
  radar_dashboard: "assistant-analytics",
  voice: "assistant-voice",
  command_console: "assistant-compact",
};
const AGENT_PERSONAS: Record<PersonaKey, string> = {
  utilities: "Field operations assistant",
  financial: "Client service assistant",
  government_federal: "Constituent services assistant",
};

const genAiAgents = (persona: Persona): EnterpriseAiAgent[] => {
  const rng = createRng(seedFor(persona, "enterprise.aiAgents"));
  const enabled = new Set<string>(
    (aiAgentSettingsShape.enums[`enabled_surfaces_${persona.key}`] ?? []).map(
      ([surface]) => surface,
    ),
  );
  const window = aiAgentSettingsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  return weights<string>(aiAgentSettingsShape.enums, "surface").map(
    ([surface], i) => ({
      id: `ai-agent-${surface}`,
      surface: surface as AiSurface,
      enabled: enabled.has(surface),
      persona: AGENT_PERSONAS[persona.key],
      model: SURFACE_MODELS[surface as AiSurface],
      // Government has no ai_agent_settings row in QA: the defaults carry a plausible edit date.
      updatedAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo + i),
    }),
  );
};

const AI_SCOPES: readonly { name: string; level: "team" | "workspace" }[] = [
  { name: "Customer Support", level: "team" },
  { name: "Collections", level: "team" },
  { name: "Billing Operations", level: "team" },
  { name: "Sales Desk", level: "team" },
  { name: "Field Service", level: "team" },
  { name: "Main workspace", level: "workspace" },
  { name: "Operations workspace", level: "workspace" },
  { name: "Finance workspace", level: "workspace" },
];

const roundTo = (n: number, step: number): number =>
  Math.round(n / step) * step;

/** Give each row (largest spend first) the surface furthest below its QA cost share, so spend by surface follows QA. */
const assignSurfaces = (
  rows: EnterpriseAiUsage[],
  cost: readonly (readonly [AiUsageSurface, number])[],
): EnterpriseAiUsage[] => {
  const costTotal = cost.reduce((n, [, c]) => n + c, 0);
  const spentTotal = rows.reduce((n, r) => n + r.spent, 0);
  const remaining = new Map(
    cost.map(([surface, c]) => [surface, (c / costTotal) * spentTotal]),
  );
  const assigned = new Map<string, AiUsageSurface>();
  for (const r of [...rows].sort((a, b) => b.spent - a.spent)) {
    const [surface] = [...remaining.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0] as [AiUsageSurface, number];
    assigned.set(r.id, surface);
    remaining.set(surface, (remaining.get(surface) ?? 0) - r.spent);
  }
  return rows.map((r) => ({ ...r, surface: assigned.get(r.id) ?? r.surface }));
};

const genAiUsage = (persona: Persona): EnterpriseAiUsage[] => {
  const rng = createRng(seedFor(persona, "enterprise.aiUsage"));
  const total = numberRange(aiUsageShape, `spend_${persona.key}`).median;
  const multiple = numberRange(aiUsageShape, "budget_multiple");
  const shares = AI_SCOPES.map(() => 0.4 + rng.next() * 1.6);
  const shareSum = shares.reduce((a, b) => a + b, 0);
  const periodEnd = new Date(
    Date.UTC(ANCHOR.getUTCFullYear(), ANCHOR.getUTCMonth() + 1, 0, 23, 59, 59),
  );
  const rows = AI_SCOPES.map((scope, i) => {
    const spent = round2((total * (shares[i] as number)) / shareSum);
    const policy = rng.weighted(
      weights<AiPolicy>(aiUsageShape.enums, "policy"),
    );
    return {
      id: `ai-usage-${i + 1}`,
      team: scope.name,
      level: scope.level,
      spent,
      budget:
        policy === "none" ? 0 : roundTo(spent * rng.range(multiple, 2), 5),
      policy,
      surface: "jareis_chat" as AiUsageSurface,
      periodEnd,
    } satisfies EnterpriseAiUsage;
  });
  return assignSurfaces(
    rows,
    weights<AiUsageSurface>(aiUsageShape.enums, `surface_cost_${persona.key}`),
  );
};

const buildAiSummary = (rows: EnterpriseAiUsage[]): EnterpriseAiSummary => {
  const spent = round2(rows.reduce((n, r) => n + r.spent, 0));
  const bySurface = new Map<AiUsageSurface, number>();
  for (const r of rows)
    bySurface.set(r.surface, (bySurface.get(r.surface) ?? 0) + r.spent);
  const top = [...bySurface.entries()].sort((a, b) => b[1] - a[1])[0];
  const daysElapsed = ANCHOR.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(ANCHOR.getUTCFullYear(), ANCHOR.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return {
    spent,
    // Tenant budget: the capped rows' sum, at least 1.5x spend (uncapped rows add no budget).
    budget: Math.max(
      round2(rows.reduce((n, r) => n + r.budget, 0)),
      roundTo(spent * 1.5, 50),
    ),
    projectedMonthEnd: round2((spent / daysElapsed) * daysInMonth),
    topSurface: top ? top[0] : "jareis_chat",
  };
};

const genSpendLimits = (
  persona: Persona,
  usage: EnterpriseAiUsage[],
  summary: EnterpriseAiSummary,
): EnterpriseSpendLimit[] => {
  const rng = createRng(seedFor(persona, "enterprise.spendLimits"));
  const used = numberRange(aiBudgetsShape, "used_share");
  const staff = rng.shuffle(agentNames);
  const alert = () => rng.pick([70, 80, 90]);
  // Tenant and team/workspace rows are the usage figures themselves, so both views agree.
  const capped = usage.filter((u) => u.policy !== "none");
  const sources = (capped.length >= 3 ? capped : usage).slice(0, 3);
  const rows: EnterpriseSpendLimit[] = [
    {
      id: "spend-limit-1",
      scope: "Tenant",
      limit: summary.budget,
      used: summary.spent,
      period: "monthly",
      policy: "soft",
      alertAt: alert(),
    },
    ...sources.map((u, i) => ({
      id: `spend-limit-${i + 2}`,
      scope: `${u.level === "team" ? "Team" : "Workspace"}: ${u.team}`,
      limit: u.budget,
      used: u.spent,
      period: "monthly" as const,
      policy: u.policy,
      alertAt: alert(),
    })),
  ];
  // User caps are small daily limits, independent of the usage rows.
  for (const name of staff.slice(
    0,
    ENTERPRISE_COUNTS.spendLimits - rows.length,
  )) {
    const limit = roundTo(summary.spent * 0.05, 5);
    const policy = rng.weighted(
      weights<AiPolicy>(aiBudgetsShape.enums, "policy"),
    );
    const share = rng.range(used, 3);
    rows.push({
      id: `spend-limit-${rows.length + 1}`,
      scope: `User: ${name}`,
      limit,
      used: round2(limit * (policy === "hard" ? Math.min(share, 1) : share)),
      period: "daily",
      policy,
      alertAt: alert(),
    });
  }
  return rows;
};

const cache = new Map<PersonaKey, EnterpriseData>();

export const enterpriseData = (persona: Persona): EnterpriseData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const support = supportData(persona);
  const network = networkData(persona);
  const myTickets = support.tickets.filter((t) => t.mine);
  const notifications = genNotifications(
    persona,
    support.tickets,
    network.exchanges.map((e) => e.id),
  );
  const accessRequests = genAccessRequests(persona);
  const searchResults = genSearchResults(persona);
  const drawnWorkflows = genWorkflows(persona);
  const workflowRuns = genWorkflowRuns(persona, drawnWorkflows);
  const workflows = withLastRuns(drawnWorkflows, workflowRuns);
  const aiAgents = genAiAgents(persona);
  const aiUsage = genAiUsage(persona);
  const aiSummary = buildAiSummary(aiUsage);
  const spendLimits = genSpendLimits(persona, aiUsage, aiSummary);
  const key = persona.key;
  const live: Record<EnterpriseRowSet, number> = {
    notifications: notificationsShape.totals[key],
    accessRequests: accessRequestsShape.totals[key],
    myTickets: myTicketsShape.totals[key],
    searchResults: searchShape.totals[key],
    workflows: workflowsShape.totals[key],
    workflowRuns: workflowRunsShape.totals[key],
    aiAgents: aiAgentSettingsShape.totals[key],
    aiUsage: aiUsageShape.totals[key],
    spendLimits: aiBudgetsShape.totals[key],
  };
  const counts: Record<EnterpriseRowSet, number> = {
    notifications: notifications.length,
    accessRequests: accessRequests.length,
    myTickets: myTickets.length,
    searchResults: searchResults.length,
    workflows: workflows.length,
    workflowRuns: workflowRuns.length,
    aiAgents: aiAgents.length,
    aiUsage: aiUsage.length,
    spendLimits: spendLimits.length,
  };
  // Never report a total below the rows on screen.
  const totals = { ...live };
  for (const set of Object.keys(counts) as EnterpriseRowSet[]) {
    totals[set] = Math.max(live[set], counts[set]);
  }
  const data: EnterpriseData = {
    notifications,
    accessRequests,
    myTickets,
    searchResults,
    analytics: {
      revenueByMonth: genRevenue(persona),
      paymentsByMethod: genPaymentsByMethod(persona),
      aging: genAging(persona),
      usage: genUsage(persona),
    },
    workflows,
    workflowRuns,
    aiAgents,
    aiUsage,
    aiSummary,
    spendLimits,
    viewer: support.viewer,
    totals,
  };
  cache.set(key, data);
  return data;
};
