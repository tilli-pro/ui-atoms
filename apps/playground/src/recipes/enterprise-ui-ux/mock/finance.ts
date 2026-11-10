import {
  type FinanceBill,
  type FinanceBillInboxMessage,
  genBillInbox,
  genBills,
} from "./finance/ap.js";
import {
  type FinanceInvoice,
  type FinanceOutboxMessage,
  type FinanceReadyToInvoice,
  type FinanceRecurring,
  type FinanceSettlement,
  genInvoices,
  genOutbox,
  genReadyToInvoice,
  genRecurring,
  genSettlements,
} from "./finance/ar.js";
import {
  type FinanceProduct,
  type FinanceRateCard,
  type FinanceSubscription,
  genProducts,
  genRateCards,
  genSubscriptions,
} from "./finance/catalogue.js";
import {
  buildTrialBalance,
  type FinanceAccount,
  type FinanceLedgerEntry,
  type FinanceTrialBalance,
  genChartOfAccounts,
  genLedger,
} from "./finance/ledger.js";
import { type FinancePayment, genPayments } from "./finance/payments.js";
import { type FinanceRowSet, financeTotals } from "./shapes/finance.js";
import type { Persona, PersonaKey } from "../specs/types.js";

export type {
  BillStatus,
  FinanceBill,
  FinanceBillInboxMessage,
} from "./finance/ap.js";
export type {
  FinanceInvoice,
  FinanceOutboxMessage,
  FinanceReadyToInvoice,
  FinanceRecurring,
  FinanceSettlement,
  InvoiceStatus,
  RecurringStatus,
  SettlementLine,
  SettlementStatus,
} from "./finance/ar.js";
export type {
  FinanceProduct,
  FinanceRateCard,
  FinanceSubscription,
  SubscriptionStatus,
} from "./finance/catalogue.js";
export type {
  AccountType,
  FinanceAccount,
  FinanceLedgerEntry,
  FinanceTrialBalance,
  FinanceTrialBalanceRow,
} from "./finance/ledger.js";
export type {
  FinancePayment,
  PaymentMethod,
  PaymentSource,
  PaymentStatus,
} from "./finance/payments.js";

export type FinanceData = {
  invoices: FinanceInvoice[];
  recurring: FinanceRecurring[];
  outbox: FinanceOutboxMessage[];
  /** Synthetic (borrowed): QA personas have none. */
  readyToInvoice: FinanceReadyToInvoice[];
  settlements: FinanceSettlement[];
  bills: FinanceBill[];
  billInbox: FinanceBillInboxMessage[];
  payments: FinancePayment[];
  ledger: FinanceLedgerEntry[];
  chartOfAccounts: FinanceAccount[];
  trialBalance: FinanceTrialBalance;
  products: FinanceProduct[];
  subscriptions: FinanceSubscription[];
  rateCards: FinanceRateCard[];
  /** Live counts per row set for this persona (synthetic sets equal the generated count). */
  totals: Record<FinanceRowSet, number>;
};

const cache = new Map<PersonaKey, FinanceData>();

export const financeData = (persona: Persona): FinanceData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const invoices = genInvoices(persona);
  const bills = genBills(persona);
  const products = genProducts(persona);
  const chartOfAccounts = genChartOfAccounts(persona);
  const totals = Object.fromEntries(
    (Object.keys(financeTotals) as FinanceRowSet[]).map((set) => [
      set,
      financeTotals[set][persona.key],
    ]),
  ) as Record<FinanceRowSet, number>;
  const data: FinanceData = {
    invoices,
    recurring: genRecurring(persona),
    outbox: genOutbox(persona, invoices),
    readyToInvoice: genReadyToInvoice(persona),
    settlements: genSettlements(persona),
    bills,
    billInbox: genBillInbox(persona),
    payments: genPayments(persona, invoices, bills),
    ledger: genLedger(persona),
    chartOfAccounts,
    trialBalance: buildTrialBalance(chartOfAccounts),
    products,
    subscriptions: genSubscriptions(persona, products),
    rateCards: genRateCards(persona),
    totals,
  };
  // Never report a total below the rows on screen.
  const counts: Partial<Record<FinanceRowSet, number>> = {
    invoices: invoices.length,
    recurring: data.recurring.length,
    outbox: data.outbox.length,
    readyToInvoice: data.readyToInvoice.length,
    settlements: data.settlements.length,
    bills: bills.length,
    billInbox: data.billInbox.length,
    payments: data.payments.length,
    ledger: data.ledger.length,
    chartOfAccounts: chartOfAccounts.length,
    products: products.length,
    subscriptions: data.subscriptions.length,
    rateCards: data.rateCards.length,
  };
  for (const set of Object.keys(counts) as FinanceRowSet[]) {
    totals[set] = Math.max(totals[set], counts[set] ?? 0);
  }
  cache.set(persona.key, data);
  return data;
};
