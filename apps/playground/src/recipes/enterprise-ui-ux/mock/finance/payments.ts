import { createRng, seedFor } from "../random.js";
import { FINANCE_COUNTS, payShape } from "../shapes/finance.js";
import { money, plusDays, round2, tenantOf, weights } from "./common.js";
import type { Persona, Row } from "../../specs/types.js";
import type { FinanceBill } from "./ap.js";
import type { FinanceInvoice } from "./ar.js";

export type PaymentStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed"
  | "reversed"
  | "refunded";
export type PaymentMethod = "ach" | "card" | "virtual_card" | "wire" | "check";
export type PaymentSource = "internal" | "tillipay" | "terminal";

export type FinancePayment = Row & {
  date: Date;
  /** An invoice number (ar) or bill number (ap). */
  document: string;
  /** Customer or vendor name. */
  party: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  /** `PAY-AR-NNNNNN` / `PAY-AP-NNNNNN`; blank for unreferenced internal approvals. */
  reference: string;
  source: PaymentSource;
};

type Doc = {
  number: string;
  party: string;
  date: Date;
  paid: number;
  kind: "ar" | "ap";
};

export const genPayments = (
  persona: Persona,
  invoices: readonly FinanceInvoice[],
  bills: readonly FinanceBill[],
): FinancePayment[] => {
  const rng = createRng(seedFor(persona, "finance.payments"));
  const tenant = tenantOf<"F1" | "G1">(payShape, persona.key);
  const enums = payShape.enums;
  // Only documents that have taken a payment can be the target of one.
  const arDocs: Doc[] = invoices
    .filter((i) => i.total - i.balance > 0)
    .map((i) => ({
      number: i.number,
      party: i.customer,
      date: i.issueDate,
      paid: round2(i.total - i.balance),
      kind: "ar",
    }));
  const apDocs: Doc[] = bills
    .filter((b) => b.total - b.balance > 0)
    .map((b) => ({
      number: b.number,
      party: b.vendor,
      date: b.issueDate,
      paid: round2(b.total - b.balance),
      kind: "ap",
    }));
  const rows = Array.from({ length: FINANCE_COUNTS.payments }, (_, i) => {
    const wantAp =
      rng.weighted(weights<string>(enums, "document_type")) === "ap";
    const pool = wantAp && apDocs.length > 0 ? apDocs : arDocs;
    const doc = rng.pick(pool);
    const drawnSource = rng.weighted(
      weights<PaymentSource>(enums, `source_${tenant}`),
    );
    // payment_transactions has 4 terminal rows (financial): keep a few visible.
    const source: PaymentSource =
      tenant === "F1" && i < 3 ? "terminal" : drawnSource;
    const status = rng.weighted(
      weights<PaymentStatus>(enums, `status_${tenant}`),
    );
    const drawn = money(
      rng,
      payShape,
      source === "terminal" ? "terminal_amount" : "amount",
    );
    return {
      doc,
      date: plusDays(doc.date, rng.next() * 45, true),
      document: doc.number,
      party: doc.party,
      // A payment never exceeds what the document has taken.
      amount: Math.min(drawn, doc.paid),
      method:
        source === "terminal"
          ? ("card" as PaymentMethod)
          : rng.weighted(weights<PaymentMethod>(enums, `method_${tenant}`)),
      status,
      source,
    };
  });
  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows
    .map(({ doc, ...r }, i): FinancePayment => {
      const blank = r.source === "internal" && r.status === "processing";
      return {
        id: `payment-${i + 1}`,
        ...r,
        reference: blank
          ? ""
          : rng.reference(`PAY-${doc.kind.toUpperCase()}`, 6),
      };
    })
    .reverse();
};
