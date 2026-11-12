import {
  balanceFor,
  money,
  plusDays,
  round2,
  tenantOf,
  weights,
} from "../common.js";
import { agentNames } from "../names.js";
import { ANCHOR, type Rng } from "../random.js";
import { arIssueWindow, arShape, payShape } from "../shapes/finance.js";
import { RELATED_COUNTS } from "../shapes/party-detail.js";
import {
  callsShape,
  ticketsCreatedWindow,
  ticketsShape,
} from "../shapes/support.js";
import type { Persona, TimelineEvent } from "../../specs/types.js";
import type {
  PartyDetail,
  ProfileInteraction,
  ProfileInvoice,
  ProfilePayment,
  ProfileTicket,
} from "./detail.js";

const SUBJECTS = [
  "Question about my latest bill",
  "Update billing address",
  "Payment not showing",
  "Request a payment plan",
  "Portal login issue",
  "Dispute a charge",
  "Request a statement copy",
  "Change contact details",
] as const;

const RESOLVED = new Set(["resolved", "closed", "confirmed"]);

const countIn = (rng: Rng, [min, max]: readonly [number, number]): number =>
  rng.int(min, max);

export const genInvoices = (rng: Rng, persona: Persona): ProfileInvoice[] => {
  const tenant = tenantOf<"U2" | "F1" | "G1">(arShape, persona.key);
  const window = arIssueWindow[tenant];
  return Array.from(
    { length: countIn(rng, RELATED_COUNTS.invoices) },
    (_, i) => {
      const status = rng.weighted(weights(arShape.enums, `status_${tenant}`));
      const total = money(rng, arShape, `total_${tenant}`);
      const terms = Number(rng.weighted(weights(arShape.enums, "terms_days")));
      const issueDate = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
      return {
        id: `invoice-${i}`,
        number: `INV-${rng.int(100_000, 999_999)}`,
        status,
        issueDate,
        dueDate: plusDays(issueDate, terms),
        total,
        balance: balanceFor(rng, status, total),
      };
    },
  );
};

export const genPayments = (
  rng: Rng,
  persona: Persona,
  invoices: ProfileInvoice[],
): ProfilePayment[] => {
  const tenant = tenantOf<"G1" | "F1">(payShape, persona.key);
  const arTenant = tenantOf<"U2" | "F1" | "G1">(arShape, persona.key);
  const paid = invoices.filter((inv) => inv.status === "paid");
  return Array.from(
    { length: countIn(rng, RELATED_COUNTS.payments) },
    (_, i) => {
      const invoice = paid[i];
      const raw = money(rng, arShape, `total_${arTenant}`);
      return {
        id: `payment-${i}`,
        date: invoice
          ? plusDays(invoice.issueDate, rng.int(1, 20), true)
          : rng.daysAgo(1, 120),
        document: invoice
          ? invoice.number
          : `BILL-${rng.int(100_000, 999_999)}`,
        amount: invoice ? round2(Math.min(raw, invoice.total)) : raw,
        method: rng.weighted(weights(payShape.enums, `method_${tenant}`)),
        status: rng.weighted(weights(payShape.enums, `status_${tenant}`)),
        reference: `PAY-${rng.int(100_000, 999_999)}`,
      };
    },
  );
};

export const genTickets = (rng: Rng, persona: Persona): ProfileTicket[] => {
  const tenant = tenantOf<"F1" | "G1">(ticketsShape, persona.key);
  const window = ticketsCreatedWindow[tenant];
  return Array.from(
    { length: countIn(rng, RELATED_COUNTS.tickets) },
    (_, i) => ({
      id: `ticket-${i}`,
      number: `TKT-${rng.int(10_000, 99_999)}`,
      subject: rng.pick(SUBJECTS),
      status: rng.weighted(weights(ticketsShape.enums, `status_${tenant}`)),
      priority: rng.weighted(weights(ticketsShape.enums, `priority_${tenant}`)),
      assignedTo: rng.bool(0.7) ? rng.pick(agentNames) : null,
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    }),
  );
};

export const genInteractions = (
  rng: Rng,
  partyPhone: string,
): ProfileInteraction[] => {
  const window = callsShape.dates ?? { fromDaysAgo: 53, toDaysAgo: 212 };
  return Array.from(
    { length: countIn(rng, RELATED_COUNTS.interactions) },
    (_, i) => {
      const direction = rng.weighted(weights(callsShape.enums, "direction"));
      const status = rng.weighted(weights(callsShape.enums, "status"));
      const seconds = money(rng, callsShape, "duration_seconds");
      return {
        id: `interaction-${i}`,
        type: rng.weighted(weights(callsShape.enums, "type")),
        direction,
        status,
        fromTo:
          direction === "inbound"
            ? `${partyPhone} → Support`
            : `Support → ${partyPhone}`,
        agent: rng.pick(agentNames),
        startedAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
        durationMinutes:
          status === "missed" ? null : Math.max(1, Math.round(seconds / 60)),
      };
    },
  );
};

const earlier = (a: Date, b: Date): Date => (a.getTime() < b.getTime() ? a : b);

type TimelineInput = Pick<
  PartyDetail,
  | "invoices"
  | "payments"
  | "tickets"
  | "interactions"
  | "source"
  | "lastSyncedAt"
>;

export const buildTimeline = (
  rng: Rng,
  d: TimelineInput,
  createdAt: Date,
): TimelineEvent[] => {
  const events: Omit<TimelineEvent, "id">[] = [];
  for (const inv of d.invoices) {
    events.push({
      at: inv.issueDate,
      title: `Invoice ${inv.number} issued`,
      module: "Invoices",
      status: inv.status,
      amount: inv.total,
    });
    if (inv.status === "paid") {
      // One settlement, one date: the linked payment's, never past the anchor.
      const settled = d.payments.find((pay) => pay.document === inv.number);
      events.push({
        at: settled ? settled.date : earlier(inv.dueDate, ANCHOR),
        title: `Invoice ${inv.number} paid`,
        module: "Invoices",
        status: inv.status,
        amount: inv.total,
      });
    }
  }
  for (const pay of d.payments) {
    events.push({
      at: pay.date,
      title: `Payment ${pay.reference} received`,
      description: `${pay.method} against ${pay.document}`,
      module: "Payments",
      status: pay.status,
      amount: pay.amount,
    });
  }
  for (const t of d.tickets) {
    events.push({
      at: t.createdAt,
      title: `Ticket ${t.number} opened`,
      description: `${t.subject} (${t.priority})`,
      module: "Tickets",
      status: t.status,
    });
    if (RESOLVED.has(t.status)) {
      events.push({
        at: plusDays(t.createdAt, rng.int(1, 20), true),
        title: `Ticket ${t.number} resolved`,
        module: "Tickets",
        status: t.status,
      });
    }
  }
  for (const call of d.interactions) {
    events.push({
      at: call.startedAt,
      title: `${call.type} ${call.direction}`,
      description: call.fromTo,
      module: "Interactions",
      status: call.status,
    });
  }
  events.push({ at: createdAt, title: "Record created", module: "System" });
  if (d.source !== "Beacon") {
    events.push({
      at: d.lastSyncedAt,
      title: `Synced from ${d.source}`,
      module: "System",
    });
  }
  return events
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .map((e, i) => ({ ...e, id: `event-${i}` }));
};
