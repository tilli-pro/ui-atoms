import { emailFor, organizationsByIndustry, personName } from "../names.js";
import { createRng, seedFor } from "../random.js";
import { apShape, billInboxShape, FINANCE_COUNTS } from "../shapes/finance.js";
import {
  balanceFor,
  byDateAsc,
  documentDates,
  money,
  weights,
} from "./common.js";
import type { Persona, Row } from "../../specs/types.js";

export type BillStatus =
  | "draft"
  | "pending_review"
  | "on_hold"
  | "rejected"
  | "approved"
  | "scheduled"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "disputed"
  | "void";

export type FinanceBill = Row & {
  /** `BILL-NNNNN`, numbered in issue-date order. */
  number: string;
  status: BillStatus;
  vendor: string;
  issueDate: Date;
  dueDate: Date;
  total: number;
  balance: number;
};

export type FinanceBillInboxMessage = Row & {
  senderName: string;
  senderEmail: string;
  /** Processed automatically (Auto badge). */
  auto: boolean;
  /** Invented subject line. */
  subject: string;
  attachments: number;
  receivedAt: Date;
  status: "received" | "processed" | "error";
};

export const genBills = (persona: Persona): FinanceBill[] => {
  const rng = createRng(seedFor(persona, "finance.bills"));
  const window = apShape.dates as { fromDaysAgo: number; toDaysAgo: number };
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.bills }, () => {
    const status = rng.weighted(weights<BillStatus>(apShape.enums, "status"));
    const terms = Number(
      rng.weighted(weights<string>(apShape.enums, "terms_days")),
    );
    const total = money(rng, apShape, "total");
    const { issueDate, dueDate } = documentDates(rng, status, window, terms);
    return {
      status,
      vendor: rng.pick(orgs),
      issueDate,
      dueDate,
      total,
      balance: balanceFor(rng, status, total),
    };
  });
  return byDateAsc(rows, (r) => r.issueDate)
    .map(
      (r, i): FinanceBill => ({
        id: `bill-${i + 1}`,
        number: rng.reference("BILL"),
        ...r,
      }),
    )
    .reverse();
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

export const genBillInbox = (persona: Persona): FinanceBillInboxMessage[] => {
  const rng = createRng(seedFor(persona, "finance.billInbox"));
  const window = billInboxShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.billInbox }, (_, i) => {
    const org = rng.pick(orgs);
    const senderName = personName(rng);
    const receivedAt = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    const month = MONTHS[receivedAt.getUTCMonth()];
    const subject = rng.pick([
      `Invoice ${rng.int(1000, 9999)} for ${month} service`,
      `${org} statement, ${month}`,
      `Payment request ${rng.int(10000, 99999)}`,
      `Order ${rng.int(100, 999)} billing`,
      `Invoice ${rng.int(1000, 9999)} attached`,
    ]);
    return {
      id: `inbox-${i + 1}`,
      senderName,
      senderEmail: emailFor(senderName, org),
      auto:
        rng.weighted(weights<string>(billInboxShape.enums, "auto")) === "true",
      subject,
      attachments: Number(
        rng.weighted(weights<string>(billInboxShape.enums, "attachments")),
      ),
      receivedAt,
      status: rng.weighted(
        weights<FinanceBillInboxMessage["status"]>(
          billInboxShape.enums,
          "status",
        ),
      ),
    };
  });
  return rows.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
};
