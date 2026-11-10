import {
  byDateAsc,
  DAY_MS,
  plusDays,
  tenantOf,
  weights,
} from "./finance/common.js";
import {
  agentNames,
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
} from "./names.js";
import { ANCHOR, createRng, type Rng, seedFor } from "./random.js";
import {
  agentStatusShape,
  callsShape,
  escalationsShape,
  SYNTHETIC_THREADS,
  threadsShape,
  ticketsCreatedWindow,
  ticketsShape,
} from "./shapes/support.js";
import type { Persona, PersonaKey, Row } from "../specs/types.js";

export type ThreadChannel = "email" | "sms" | "chat";
export type ThreadStatus = "unread" | "read" | "replied" | "escalated";
export type EscalationPriority = "critical" | "high" | "medium" | "low";
export type EscalationStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";
export type CallType = "voice" | "sms" | "email" | "chat";
export type CallDirection = "inbound" | "outbound";
export type CallStatus = "completed" | "missed";
export type TicketStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "in_progress"
  | "waiting_customer"
  | "waiting_internal"
  | "resolved"
  | "confirmed"
  | "closed"
  | "reopened";
export type TicketPriority = "urgent" | "high" | "medium" | "low";
export type Presence = "available" | "busy" | "away" | "offline";

/** Inbound message thread (synthetic: QA has no inbound messages). */
export type SupportThread = Row & {
  channel: ThreadChannel;
  from: string;
  /** Email address, or a phone number for sms. */
  fromDetail: string;
  subject: string;
  preview: string;
  receivedAt: Date;
  status: ThreadStatus;
  assignedTo: string | null;
  /** Linked case number (the digits of a ticket reference), or null. */
  ticketNumber: number | null;
};

export type SupportEscalation = Row & {
  /** `ESC-` reference, assigned in creation order. */
  reference: string;
  subject: string;
  contact: string;
  organization: string | null;
  /** 0-1, rendered as a percent. */
  confidence: number;
  priority: EscalationPriority;
  status: EscalationStatus;
  assignedTo: string | null;
  category: string | null;
  createdAt: Date;
  /** The Age column turns red when this is before the anchor. */
  slaDueAt: Date;
  aiSuggested: boolean;
};

export type SupportCall = Row & {
  type: CallType;
  direction: CallDirection;
  party: string;
  phone: string;
  /** Minutes with one decimal; null when missed. */
  durationMinutes: number | null;
  agent: string;
  startedAt: Date;
  status: CallStatus;
  disposition: string | null;
  /** Seconds in queue before an answer; null when missed (abandoned). */
  waitSeconds: number | null;
};

export type SupportTicket = Row & {
  /** `TKT-` reference, assigned in creation order. */
  number: string;
  subject: string;
  /** Person or organization name. */
  customer: string;
  /** Second line under the customer (government rows link both), or null. */
  customerOrganization: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  assignedTo: string | null;
  slaDueAt: Date | null;
  /** slaDueAt before the anchor and the ticket is not resolved, confirmed or closed. */
  slaBreached: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Assigned to the viewer (the first agent name). */
  mine: boolean;
};

export type SupportAgent = Row & {
  name: string;
  email: string;
  presence: Presence;
  /** Open tickets assigned to this agent. */
  openTickets: number;
  onCall: boolean;
  lastSeenAt: Date;
};

export type SupportQueueItem = Row & {
  kind: "ticket" | "escalation";
  reference: string;
  subject: string;
  priority: string;
  dueAt: Date | null;
};

export type CallHour = { hour: number; calls: number };

export type CallStats = {
  /** Calls per UTC hour (0-23) on the anchor day. */
  hourly: CallHour[];
  /** Calls started on the anchor day. */
  callsToday: number;
  total: number;
  answered: number;
  missed: number;
  avgWaitSeconds: number;
  avgHandleSeconds: number;
  /** Share of answered calls picked up within 20 seconds. */
  slaPercent: number;
  /** Missed share of all calls. */
  abandonPercent: number;
};

export type SupportRowSet =
  | "threads"
  | "escalations"
  | "calls"
  | "tickets"
  | "agents";

export type SupportData = {
  threads: SupportThread[];
  escalations: SupportEscalation[];
  calls: SupportCall[];
  tickets: SupportTicket[];
  agents: SupportAgent[];
  queue: SupportQueueItem[];
  callStats: CallStats;
  /** The viewer's name (the first agent). */
  viewer: string;
  /** Live counts per row set for this persona (never below the rows generated). */
  totals: Record<SupportRowSet, number>;
};

const COUNTS = { escalations: 44, calls: 52 } as const;
const TICKET_COUNT: Record<PersonaKey, number> = {
  utilities: 40,
  financial: 56,
  government_federal: 56,
};
const VIEWER = agentNames[0] as string;
/** Share of generated calls on the anchor day, so the hourly panel is not empty (QA has none in 30 days). */
const CALLS_TODAY_SHARE = 0.28;
/** Share of tickets created in the last 10 days, so some SLAs are still ahead (QA: all overdue). */
const RECENT_TICKET_SHARE = 0.35;
const SLA_HOURS: Record<string, number> = {
  critical: 4,
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72,
};
const CLOSED_LIKE = new Set<TicketStatus>(["resolved", "confirmed", "closed"]);
const HOUR_MS = 60 * 60 * 1000;

type Topic = { subject: string; preview: string };

/** Invented, templated subjects (no QA text). */
const topicsByPersona: Record<PersonaKey, readonly Topic[]> = {
  utilities: [
    {
      subject: "Question about my last bill",
      preview:
        "My latest bill looks higher than usual and I would like to understand the charges.",
    },
    {
      subject: "Water pressure is low on our street",
      preview:
        "Pressure has been weak since Monday morning and several neighbors see the same.",
    },
    {
      subject: "Meter reading looks wrong",
      preview:
        "The reading on my statement does not match the number on the meter.",
    },
    {
      subject: "Power flickers in the evening",
      preview:
        "Lights flicker every evening around six and it has happened four days in a row.",
    },
    {
      subject: "Set up a payment plan",
      preview:
        "I am behind on this month and would like to spread the balance over a few weeks.",
    },
    {
      subject: "Moving out next month",
      preview:
        "Please stop service at my address on the last day of next month.",
    },
    {
      subject: "Gas smell near the meter",
      preview:
        "There is a faint gas smell by the meter outside and I wanted to report it.",
    },
    {
      subject: "Autopay did not run",
      preview:
        "My autopay was supposed to run on the first but nothing was drawn.",
    },
  ],
  financial: [
    {
      subject: "Card was declined abroad",
      preview:
        "My card was declined twice while traveling even though I had notified the bank.",
    },
    {
      subject: "Unrecognized charge on statement",
      preview:
        "There is a charge from a merchant I do not recognize on my last statement.",
    },
    {
      subject: "Update my mailing address",
      preview:
        "I moved last month and need all statements sent to my new address.",
    },
    {
      subject: "Wire transfer still pending",
      preview:
        "The wire I sent on Friday still shows as pending and the payee has not received it.",
    },
    {
      subject: "Increase my credit limit",
      preview:
        "I would like to review whether my credit limit can be increased.",
    },
    {
      subject: "Merchant terminal is offline",
      preview:
        "Our payment terminal has not connected since this morning and customers are waiting.",
    },
    {
      subject: "Rewards points missing",
      preview:
        "My points from last month's purchases have not been posted to my account.",
    },
    {
      subject: "Close a joint account",
      preview:
        "We would like to close our joint account and move the balance to a new one.",
    },
  ],
  government_federal: [
    {
      subject: "Status of my license renewal",
      preview:
        "I submitted my renewal six weeks ago and have not heard back about its status.",
    },
    {
      subject: "Records request acknowledgement",
      preview:
        "Please confirm that my public records request was received and logged.",
    },
    {
      subject: "Cannot sign in to the portal",
      preview:
        "The portal rejects my password and the reset email never arrives.",
    },
    {
      subject: "Question about a filing deadline",
      preview:
        "Can you confirm the deadline for this year's regulatory filing?",
    },
    {
      subject: "Correction to my application",
      preview:
        "I entered the wrong date of birth on my application and need it corrected.",
    },
    {
      subject: "Office hours for in-person help",
      preview:
        "What are the office hours for in-person assistance with permits?",
    },
    {
      subject: "Transfer between agencies",
      preview:
        "My case needs to move to the neighboring agency; who should I contact?",
    },
    {
      subject: "Budget inquiry follow-up",
      preview:
        "Following up on the budget question I raised during last week's call.",
    },
  ],
};

const ticketSubjects: Record<string, readonly [string, string]> = {
  card_services: [
    "Replacement card not received",
    "Card declined at point of sale",
  ],
  technical: [
    "Mobile app crashes on login",
    "Online portal shows a blank page",
  ],
  account_maintenance: [
    "Update contact details on file",
    "Change account holder name",
  ],
  merchant_services: ["Terminal will not connect", "Settlement report missing"],
  disputes: ["Dispute a duplicate charge", "Chargeback status update"],
  fraud: ["Suspicious login alert", "Possible fraudulent transaction"],
  rewards: ["Points not credited", "Redeem rewards for statement credit"],
  billing: ["Question about my last bill", "Late fee applied in error"],
  meter_service: ["Meter reading looks wrong", "Request a meter replacement"],
  commercial_accounts: [
    "Add a second service location",
    "Change business account contact",
  ],
  energy_programs: ["Enroll in a budget billing program", "Rebate not applied"],
  safety: ["Report a safety concern", "Damaged line near the property"],
  "Security Clearance": [
    "Clearance status inquiry",
    "Update to clearance paperwork",
  ],
  "IT Infrastructure": [
    "Workstation cannot reach the network",
    "Request additional storage",
  ],
  "Compliance Audit": [
    "Audit documents request",
    "Scheduling the compliance review",
  ],
  "FOIA Request": [
    "Acknowledge a FOIA request",
    "Extension on a FOIA response",
  ],
  "License Renewal": ["License renewal status", "Fee question on renewal"],
  "Interagency Transfer": [
    "Transfer file to another agency",
    "Confirm receipt of transfer",
  ],
  "Policy Question": [
    "Clarify a policy requirement",
    "Policy exception request",
  ],
  "Budget Inquiry": ["Budget line item question", "Reallocation request"],
  "Regulatory Filing": [
    "Filing deadline question",
    "Correct a submitted filing",
  ],
  "Whistleblower Report": [
    "Follow up on a confidential report",
    "Question about reporting channels",
  ],
  "System Access": [
    "Request access to the case system",
    "Password reset not working",
  ],
  "Public Records Request": [
    "Public records request status",
    "Narrow the scope of a request",
  ],
};

const generalSubjects = [
  "General question",
  "Follow-up on an earlier call",
] as const;

/** Financial categories shown in a utilities vocabulary (weights unchanged). */
const utilitiesCategory: Record<string, string> = {
  card_services: "meter_service",
  merchant_services: "commercial_accounts",
  rewards: "energy_programs",
  fraud: "safety",
};

const escalationSubjects: Record<string, readonly [string, string]> = {
  billing: [
    "Customer disputes a large balance",
    "Repeated billing complaint needs review",
  ],
  Safety: [
    "Caller reports a safety hazard",
    "Urgent safety concern raised twice",
  ],
  technical: [
    "Portal outage affecting several customers",
    "Integration error reported by customer",
  ],
  none: [
    "Customer asks for a supervisor",
    "Complaint escalated after three contacts",
  ],
};

const dispositions = [
  "Resolved on call",
  "Follow-up needed",
  "Transferred",
  "Callback scheduled",
  "Information provided",
] as const;

const agentFor = (rng: Rng): string => rng.pick(agentNames);

/** Viewer 27% of the time, otherwise any other agent. */
const assignee = (rng: Rng): string =>
  rng.bool(0.27) ? VIEWER : (rng.pick(agentNames.slice(1)) as string);

const hourDate = (day: Date, hour: number, rng: Rng): Date => {
  const out = new Date(day);
  out.setUTCHours(hour, rng.int(0, 59), rng.int(0, 59), 0);
  return out;
};

const genTickets = (persona: Persona): SupportTicket[] => {
  const rng = createRng(seedFor(persona, "support.tickets"));
  const tenant = tenantOf<"F1" | "G1">(ticketsShape, persona.key);
  const window =
    persona.key === "utilities"
      ? ticketsCreatedWindow.U1
      : ticketsCreatedWindow[tenant];
  const enums = ticketsShape.enums;
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: TICKET_COUNT[persona.key] }, (_, i) => {
    const status = rng.weighted(
      weights<TicketStatus>(enums, `status_${tenant}`),
    );
    const priority = rng.weighted(
      weights<TicketPriority>(enums, `priority_${tenant}`),
    );
    const rawCategory = rng.weighted(weights(enums, `category_${tenant}`));
    const category =
      rawCategory === "none"
        ? null
        : persona.key === "utilities"
          ? (utilitiesCategory[rawCategory] ?? rawCategory)
          : rawCategory;
    const createdAt = rng.bool(RECENT_TICKET_SHARE)
      ? rng.daysAgo(0, 10)
      : rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const subjects = category
      ? (ticketSubjects[category] ?? generalSubjects)
      : generalSubjects;
    let customer: string;
    let customerOrganization: string | null = null;
    if (tenant === "G1") {
      customer = personName(rng);
      customerOrganization = rng.pick(orgs);
    } else {
      const kind = rng.weighted(weights(enums, "customer_kind_F1"));
      customer = kind === "person" ? personName(rng) : rng.pick(orgs);
    }
    // New and triaged tickets are not yet assigned.
    const unassigned = status === "new" || status === "triaged";
    const assignedTo = unassigned ? null : assignee(rng);
    const slaDueAt = rng.bool(0.98)
      ? new Date(createdAt.getTime() + (SLA_HOURS[priority] ?? 24) * HOUR_MS)
      : null;
    const sinceDays = (ANCHOR.getTime() - createdAt.getTime()) / DAY_MS;
    const updatedAt = plusDays(
      createdAt,
      rng.next() * Math.min(8, sinceDays),
      true,
    );
    return {
      subject: rng.pick(subjects),
      customer,
      customerOrganization,
      status,
      priority,
      category,
      assignedTo,
      slaDueAt,
      slaBreached:
        slaDueAt !== null &&
        slaDueAt.getTime() < ANCHOR.getTime() &&
        !CLOSED_LIKE.has(status),
      createdAt,
      updatedAt,
      mine: assignedTo === VIEWER,
    };
  });
  // References follow creation order; the list shows newest first.
  const refs = createRng(seedFor(persona, "support.tickets.ref"));
  return byDateAsc(rows, (r) => r.createdAt)
    .map(
      (r, i): SupportTicket => ({
        id: `ticket-${i + 1}`,
        number: refs.reference("TKT", 4),
        ...r,
      }),
    )
    .reverse();
};

const genThreads = (
  persona: Persona,
  tickets: SupportTicket[],
): SupportThread[] => {
  const rng = createRng(seedFor(persona, "support.threads"));
  const topics = topicsByPersona[persona.key];
  const orgs = organizationsByIndustry[persona.key];
  const enums = threadsShape.enums;
  const rows = Array.from(
    { length: SYNTHETIC_THREADS },
    (_, i): SupportThread => {
      const channel = rng.weighted(weights<ThreadChannel>(enums, "channel"));
      const status = rng.weighted(weights<ThreadStatus>(enums, "status"));
      const from = personName(rng);
      const topic = rng.pick(topics);
      const linked = status === "escalated" ? rng.bool(0.8) : rng.bool(0.15);
      const ticket = linked ? rng.pick(tickets) : null;
      const worked = status === "replied" || status === "escalated";
      return {
        id: `thread-${i + 1}`,
        channel,
        from,
        fromDetail:
          channel === "sms" ? phone(rng) : emailFor(from, rng.pick(orgs)),
        subject: topic.subject,
        preview: topic.preview,
        receivedAt: rng.daysAgo(0, 10),
        status,
        assignedTo: worked || rng.bool(0.25) ? agentFor(rng) : null,
        ticketNumber: ticket ? Number(ticket.number.replace("TKT-", "")) : null,
      };
    },
  );
  return rows.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
};

const PRIORITY_RANK: Record<EscalationPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const genEscalations = (persona: Persona): SupportEscalation[] => {
  const rng = createRng(seedFor(persona, "support.escalations"));
  const enums = escalationsShape.enums;
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: COUNTS.escalations }, () => {
    const priority = rng.weighted(
      weights<EscalationPriority>(enums, "priority"),
    );
    const status = rng.weighted(weights<EscalationStatus>(enums, "status"));
    const rawCategory = rng.weighted(weights(enums, "category"));
    const createdAt = rng.daysAgo(0, 14);
    return {
      subject: rng.pick(
        escalationSubjects[rawCategory] ??
          (escalationSubjects.none as readonly [string, string]),
      ),
      contact: personName(rng),
      organization: rng.bool(0.4) ? rng.pick(orgs) : null,
      confidence:
        Math.round(
          rng.range(
            (escalationsShape.numbers ?? {}).confidence_pct as {
              min: number;
              median: number;
              max: number;
            },
            0,
          ),
        ) / 100,
      priority,
      status,
      assignedTo: status === "pending" ? null : assignee(rng),
      category: rawCategory === "none" ? null : rawCategory,
      createdAt,
      slaDueAt: new Date(
        createdAt.getTime() + (SLA_HOURS[priority] ?? 24) * HOUR_MS,
      ),
      aiSuggested: rng.bool(0.45),
    };
  });
  const refs = createRng(seedFor(persona, "support.escalations.ref"));
  const numbered = byDateAsc(rows, (r) => r.createdAt).map(
    (r, i): SupportEscalation => ({
      id: `escalation-${i + 1}`,
      reference: refs.reference("ESC", 4),
      ...r,
    }),
  );
  // Appendix order: priority rank, then oldest first.
  return numbered.sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  );
};

const genCalls = (persona: Persona): SupportCall[] => {
  const rng = createRng(seedFor(persona, "support.calls"));
  const enums = callsShape.enums;
  const nums = callsShape.numbers as NonNullable<typeof callsShape.numbers>;
  const window = callsShape.dates as NonNullable<typeof callsShape.dates>;
  const rows = Array.from({ length: COUNTS.calls }, (_, i): SupportCall => {
    const today = rng.bool(CALLS_TODAY_SHARE);
    const startedAt = today
      ? hourDate(
          rng.daysAgo(0, 0),
          Number(rng.weighted(weights(enums, "hour_today"))),
          rng,
        )
      : hourDate(
          rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
          Number(rng.weighted(weights(enums, "hour"))),
          rng,
        );
    const status = rng.weighted(weights<CallStatus>(enums, "status"));
    const answered = status === "completed";
    const seconds = answered
      ? rng.range(nums.duration_seconds as never, 0)
      : null;
    return {
      id: `call-${i + 1}`,
      type: rng.weighted(weights<CallType>(enums, "type")),
      direction: rng.weighted(weights<CallDirection>(enums, "direction")),
      party: personName(rng),
      phone: phone(rng),
      durationMinutes: seconds === null ? null : Math.round(seconds / 6) / 10,
      agent: agentFor(rng),
      startedAt: new Date(Math.min(startedAt.getTime(), ANCHOR.getTime())),
      status,
      disposition:
        answered &&
        rng.weighted(weights(enums, "disposition_present")) === "present"
          ? rng.pick(dispositions)
          : null,
      waitSeconds: answered
        ? Math.round(rng.range(nums.wait_seconds as never, 0))
        : null,
    };
  });
  return rows.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
};

const genAgents = (
  persona: Persona,
  tickets: SupportTicket[],
): SupportAgent[] => {
  const rng = createRng(seedFor(persona, "support.agents"));
  return agentNames.map((name, i): SupportAgent => {
    // The viewer is always online.
    const presence =
      i === 0
        ? "available"
        : rng.weighted(weights<Presence>(agentStatusShape.enums, "presence"));
    const online = presence !== "offline";
    return {
      id: `agent-${i + 1}`,
      name,
      email: emailFor(name, "Service Desk"),
      presence,
      openTickets: tickets.filter(
        (t) => t.assignedTo === name && !CLOSED_LIKE.has(t.status),
      ).length,
      onCall: online && rng.bool(0.25),
      lastSeenAt: online
        ? new Date(ANCHOR.getTime() - rng.int(0, 30) * 60_000)
        : new Date(ANCHOR.getTime() - rng.int(3, 72) * HOUR_MS),
    };
  });
};

const genQueue = (
  tickets: SupportTicket[],
  escalations: SupportEscalation[],
): SupportQueueItem[] => {
  const mine: SupportQueueItem[] = [
    ...tickets
      .filter((t) => t.mine && !CLOSED_LIKE.has(t.status))
      .map(
        (t): SupportQueueItem => ({
          id: `queue-${t.id}`,
          kind: "ticket",
          reference: t.number,
          subject: t.subject,
          priority: t.priority,
          dueAt: t.slaDueAt,
        }),
      ),
    ...escalations
      .filter(
        (e) =>
          e.assignedTo === VIEWER &&
          e.status !== "resolved" &&
          e.status !== "closed",
      )
      .map(
        (e): SupportQueueItem => ({
          id: `queue-${e.id}`,
          kind: "escalation",
          reference: e.reference,
          subject: e.subject,
          priority: e.priority,
          dueAt: e.slaDueAt,
        }),
      ),
  ];
  const due = (item: SupportQueueItem) =>
    item.dueAt ? item.dueAt.getTime() : Number.POSITIVE_INFINITY;
  return mine.sort((a, b) => due(a) - due(b)).slice(0, 10);
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

const buildCallStats = (calls: SupportCall[]): CallStats => {
  const dayStart = Date.UTC(
    ANCHOR.getUTCFullYear(),
    ANCHOR.getUTCMonth(),
    ANCHOR.getUTCDate(),
  );
  const hourly: CallHour[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    calls: 0,
  }));
  let callsToday = 0;
  for (const call of calls) {
    const t = call.startedAt.getTime();
    if (t >= dayStart && t < dayStart + DAY_MS) {
      const slot = hourly[call.startedAt.getUTCHours()];
      if (slot) slot.calls += 1;
      callsToday += 1;
    }
  }
  const answeredCalls = calls.filter((c) => c.status === "completed");
  const mean = (values: number[]) =>
    values.length === 0
      ? 0
      : values.reduce((sum, v) => sum + v, 0) / values.length;
  const waits = answeredCalls.map((c) => c.waitSeconds ?? 0);
  return {
    hourly,
    callsToday,
    total: calls.length,
    answered: answeredCalls.length,
    missed: calls.length - answeredCalls.length,
    avgWaitSeconds: Math.round(mean(waits)),
    avgHandleSeconds: Math.round(
      mean(answeredCalls.map((c) => (c.durationMinutes ?? 0) * 60)),
    ),
    slaPercent: round1(
      answeredCalls.length === 0
        ? 0
        : (waits.filter((w) => w <= 20).length / answeredCalls.length) * 100,
    ),
    abandonPercent: round1(
      calls.length === 0
        ? 0
        : ((calls.length - answeredCalls.length) / calls.length) * 100,
    ),
  };
};

const cache = new Map<PersonaKey, SupportData>();

export const supportData = (persona: Persona): SupportData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const tickets = genTickets(persona);
  const threads = genThreads(persona, tickets);
  const escalations = genEscalations(persona);
  const calls = genCalls(persona);
  const agents = genAgents(persona, tickets);
  const totals: Record<SupportRowSet, number> = {
    threads: threadsShape.totals[persona.key],
    escalations: escalationsShape.totals[persona.key],
    calls: callsShape.totals[persona.key],
    tickets: ticketsShape.totals[persona.key],
    agents: agentStatusShape.totals[persona.key],
  };
  // Never report a total below the rows on screen.
  const counts: Record<SupportRowSet, number> = {
    threads: threads.length,
    escalations: escalations.length,
    calls: calls.length,
    tickets: tickets.length,
    agents: agents.length,
  };
  for (const set of Object.keys(counts) as SupportRowSet[]) {
    totals[set] = Math.max(totals[set], counts[set]);
  }
  const data: SupportData = {
    threads,
    escalations,
    calls,
    tickets,
    agents,
    queue: genQueue(tickets, escalations),
    callStats: buildCallStats(calls),
    viewer: VIEWER,
    totals,
  };
  cache.set(persona.key, data);
  return data;
};
