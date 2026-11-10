import {
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
} from "../names.js";
import { ANCHOR, createRng, seedFor } from "../random.js";
import {
  arIssueWindow,
  arShape,
  FINANCE_COUNTS,
  outboxShape,
  readyToInvoiceShape,
  recurringNextRunAheadDays,
  recurringShape,
  settlementsShape,
} from "../shapes/finance.js";
import {
  balanceFor,
  byDateAsc,
  documentDates,
  money,
  numberRange,
  partyName,
  plusDays,
  round2,
  tenantOf,
  weights,
} from "./common.js";
import type { Persona, Row } from "../../specs/types.js";

export type InvoiceStatus =
  | "draft"
  | "open"
  | "sent"
  | "viewed"
  | "overdue"
  | "partially_paid"
  | "paid"
  | "written_off"
  | "void";

export type FinanceInvoice = Row & {
  /** `INV-NNNNNN`, numbered in issue-date order. */
  number: string;
  status: InvoiceStatus;
  /** "Beacon", "ERP" or an integration label such as "Oracle CC&B". */
  source: string;
  customer: string;
  issueDate: Date;
  dueDate: Date;
  total: number;
  balance: number;
  createdAt: Date;
};

export type RecurringStatus = "active" | "cancelled" | "paused" | "completed";

export type FinanceRecurring = Row & {
  /** `RS-NNNNN`. */
  number: string;
  status: RecurringStatus;
  frequency: "monthly" | "annually";
  customer: string;
  nextRun: Date;
  /** Last run, or null if the schedule never ran. */
  lastRun: Date | null;
  lastRunFailed: boolean;
  amount: number;
  createdAt: Date;
};

export type FinanceOutboxMessage = Row & {
  /** Recipient name. */
  recipient: string;
  /** Email address, or a phone number for sms. */
  contact: string;
  /** An invoice number from `invoices`. */
  document: string;
  channel: "email" | "sms";
  status: "sent" | "failed";
  sentAt: Date;
};

export type FinanceReadyToInvoice = Row & {
  /** `SVC-NNNNN`. */
  order: string;
  customer: string;
  /** Order status. */
  status: "draft" | "submitted" | "confirmed" | "closed";
  unbilled: number;
  /** Summary of the unbilled work, for example "3 time entries, 2 materials". */
  unbilledItems: string;
  hours: number;
  canInvoiceNow: boolean;
  /** Why the order cannot be invoiced yet; empty when `canInvoiceNow`. */
  reasons: string[];
};

export type SettlementStatus = "sent" | "paid" | "pending_review";

export type SettlementLine = {
  description: string;
  quantity: number;
  /** Fee per unit. */
  rate: number;
  /** quantity x rate. */
  amount: number;
  /** Source document, for example "ar:INV-004512". */
  sourceRef: string;
  /** Inside the settlement period. */
  eventDate: Date;
};

export type FinanceSettlement = Row & {
  /** `NETSET-YYYYMM-NNNN`. */
  number: string;
  /** Month label, for example "October 2026". */
  period: string;
  periodStart: Date;
  partner: string;
  side: "receivable" | "payable";
  accrued: number;
  settled: number;
  status: SettlementStatus;
  disputes: number;
  /** 3-6 accrual lines for the side-panel sheet; they sum to `accrued`. */
  lines: SettlementLine[];
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const genInvoices = (persona: Persona): FinanceInvoice[] => {
  const rng = createRng(seedFor(persona, "finance.invoices"));
  const tenant = tenantOf<"U2" | "F1" | "G1">(arShape, persona.key);
  const enums = arShape.enums;
  const window = arIssueWindow[tenant];
  const rows = Array.from({ length: FINANCE_COUNTS.invoices }, () => {
    const status = rng.weighted(
      weights<InvoiceStatus>(enums, `status_${tenant}`),
    );
    const terms = Number(rng.weighted(weights<string>(enums, "terms_days")));
    const total = money(rng, arShape, `total_${tenant}`);
    return {
      status,
      source: rng.weighted(
        weights<string>(enums, tenant === "F1" ? "source_F1" : "source_none"),
      ),
      customer: partyName(rng, persona),
      ...documentDates(rng, status, window, terms),
      total,
      balance: balanceFor(rng, status, total),
    };
  });
  // Numbers follow issue-date order (oldest first), then the list reads newest first.
  const numbered = byDateAsc(rows, (r) => r.issueDate).map(
    (r, i): FinanceInvoice => ({
      id: `invoice-${i + 1}`,
      number: rng.reference("INV", 6),
      ...r,
    }),
  );
  return numbered.reverse();
};

export const genRecurring = (persona: Persona): FinanceRecurring[] => {
  const rng = createRng(seedFor(persona, "finance.recurring"));
  const window = recurringShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const tenant = tenantOf<"U1" | "F1">(recurringShape, persona.key);
  const rows = Array.from({ length: FINANCE_COUNTS.recurring }, () => {
    const createdAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const status = rng.weighted(
      weights<RecurringStatus>(recurringShape.enums, `status_${tenant}`),
    );
    const ran = status === "active" || rng.bool(0.7);
    return {
      status,
      // Between creation and the anchor.
      lastRun: ran
        ? plusDays(
            createdAt,
            rng.next() *
              Math.max(0, (ANCHOR.getTime() - createdAt.getTime()) / 86400000),
            true,
          )
        : null,
      lastRunFailed: ran && rng.bool(0.1),
      frequency: rng.weighted(
        weights<"monthly" | "annually">(recurringShape.enums, "frequency"),
      ),
      customer: partyName(rng, persona),
      // Always after the anchor; created_at is in the past.
      nextRun: rng.daysAhead(1, recurringNextRunAheadDays),
      amount: money(rng, recurringShape, "amount"),
      createdAt,
    };
  });
  return byDateAsc(rows, (r) => r.createdAt)
    .map(
      (r, i): FinanceRecurring => ({
        id: `recurring-${i + 1}`,
        number: rng.reference("RS"),
        ...r,
      }),
    )
    .reverse();
};

export const genOutbox = (
  persona: Persona,
  invoices: readonly FinanceInvoice[],
): FinanceOutboxMessage[] => {
  const rng = createRng(seedFor(persona, "finance.outbox"));
  const tenant = tenantOf<"U1" | "F1" | "G1">(outboxShape, persona.key);
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.outbox }, (_, i) => {
    const invoice = rng.pick(invoices);
    const recipient = personName(rng);
    const channel = rng.weighted(
      weights<"email" | "sms">(outboxShape.enums, "channel"),
    );
    return {
      id: `outbox-${i + 1}`,
      recipient,
      contact:
        channel === "sms"
          ? phone(rng)
          : emailFor(recipient, invoice.customer || rng.pick(orgs)),
      document: invoice.number,
      channel,
      status: rng.weighted(
        weights<"sent" | "failed">(outboxShape.enums, `status_${tenant}`),
      ),
      // Sent after the invoice was issued, never past the anchor.
      sentAt: plusDays(invoice.issueDate, rng.next() * 30, true),
    };
  });
  return rows.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
};

const NOT_READY_REASONS = [
  "Time entries awaiting approval",
  "Materials not yet received",
  "Appointment not completed",
  "Order not confirmed",
] as const;

const plural = (n: number, one: string, many: string): string =>
  `${n} ${n === 1 ? one : many}`;

export const genReadyToInvoice = (
  persona: Persona,
): FinanceReadyToInvoice[] => {
  const rng = createRng(seedFor(persona, "finance.readyToInvoice"));
  return Array.from({ length: FINANCE_COUNTS.readyToInvoice }, (_, i) => {
    const canInvoiceNow =
      rng.weighted(
        weights<string>(readyToInvoiceShape.enums, "can_invoice_now"),
      ) === "yes";
    const entries = rng.int(1, 6);
    const materials = rng.int(0, 4);
    return {
      id: `ready-${i + 1}`,
      order: rng.reference("SVC"),
      customer: partyName(rng, persona),
      status: rng.weighted(
        weights<FinanceReadyToInvoice["status"]>(
          readyToInvoiceShape.enums,
          "status",
        ),
      ),
      unbilled: money(rng, readyToInvoiceShape, "unbilled"),
      unbilledItems: [
        plural(entries, "time entry", "time entries"),
        materials > 0 ? plural(materials, "material", "materials") : "",
      ]
        .filter(Boolean)
        .join(", "),
      hours: rng.range(numberRange(readyToInvoiceShape, "hours"), 1),
      canInvoiceNow,
      reasons: canInvoiceNow
        ? []
        : rng.shuffle(NOT_READY_REASONS).slice(0, rng.int(1, 2)),
    };
  });
};

const ACCRUAL_LINES = [
  "Invoice finalized fee",
  "Payment processing fee",
  "Network onboarding fee",
  "Document exchange fee",
  "Statement delivery fee",
  "Dispute handling fee",
] as const;

export const genSettlements = (persona: Persona): FinanceSettlement[] => {
  const rng = createRng(seedFor(persona, "finance.settlements"));
  const enums = settlementsShape.enums;
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.settlements }, () => {
    // One of the 12 closed months before the anchor's month (1st, UTC).
    const monthsBack = rng.int(1, 12);
    const periodStart = new Date(
      Date.UTC(ANCHOR.getUTCFullYear(), ANCHOR.getUTCMonth() - monthsBack, 1),
    );
    const side = rng.weighted(weights<"receivable" | "payable">(enums, "side"));
    const status = rng.weighted(
      weights<SettlementStatus>(enums, `status_${side}`),
    );
    const lines = rng
      .shuffle(ACCRUAL_LINES)
      .slice(0, rng.int(3, 6))
      .map((description): SettlementLine => {
        const quantity = Math.round(
          rng.range(numberRange(settlementsShape, "quantity")),
        );
        const rate = round2(rng.range(numberRange(settlementsShape, "fee")));
        return {
          description,
          quantity,
          rate,
          amount: round2(quantity * rate),
          sourceRef: `ar:INV-${String(rng.int(1, 999999)).padStart(6, "0")}`,
          eventDate: plusDays(periodStart, rng.int(0, 27)),
        };
      });
    const accrued = round2(lines.reduce((sum, l) => sum + l.amount, 0));
    const settled =
      status === "paid"
        ? accrued
        : status === "sent" && rng.bool(0.2)
          ? round2(accrued * 0.5)
          : 0;
    return {
      period: `${MONTHS[periodStart.getUTCMonth()]} ${periodStart.getUTCFullYear()}`,
      periodStart,
      partner: rng.pick(orgs),
      side,
      accrued,
      settled,
      status,
      disputes: Number(rng.weighted(weights<string>(enums, "disputes"))),
      lines,
    };
  });
  return byDateAsc(rows, (r) => r.periodStart)
    .map(
      (r, i): FinanceSettlement => ({
        id: `settlement-${i + 1}`,
        number: `NETSET-${r.periodStart.getUTCFullYear()}${String(
          r.periodStart.getUTCMonth() + 1,
        ).padStart(2, "0")}-${rng.reference("S", 4).slice(2)}`,
        ...r,
      }),
    )
    .reverse();
};
