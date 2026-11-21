import { createRng, seedFor } from "../random.js";
import {
  chartOfAccountsShape,
  FINANCE_COUNTS,
  ledgerShape,
  ledgerWindow,
} from "../shapes/finance.js";
import { byDateAsc, money, round2, tenantOf, weights } from "./common.js";
import type { Persona, Row } from "../../specs/types.js";

export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

export type FinanceLedgerEntry = Row & {
  date: Date;
  /** `JE-NNNNN`, numbered in date order. */
  journal: string;
  description: string;
  /** Code and name, for example "1200 Accounts Receivable". */
  account: string;
  category: AccountType;
  debit: number;
  credit: number;
  /** Running balance of the account after this entry (posted entries only). */
  balance: number;
  status: "posted" | "pending" | "voided";
};

export type FinanceAccount = Row & {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  /** 0-2: indent level. */
  depth: 0 | 1 | 2;
  parentCode: string | null;
  /** System accounts cannot be deleted. */
  system: boolean;
  active: boolean;
};

export type FinanceTrialBalanceRow = Row & {
  code: string;
  name: string;
  debit: number;
  credit: number;
};

export type FinanceTrialBalance = {
  rows: FinanceTrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
};

/** code, name, type, parent, system. Shaped like the government default system CoA, extended. */
const ACCOUNTS: readonly (readonly [
  string,
  string,
  AccountType,
  string | null,
  boolean,
])[] = [
  ["1000", "Cash & Bank", "asset", null, true],
  ["1100", "Short-term Investments", "asset", null, false],
  ["1200", "Accounts Receivable", "asset", null, true],
  ["1250", "Unbilled Receivables", "asset", null, false],
  ["1300", "Prepaid Expenses", "asset", null, false],
  ["1500", "Equipment", "asset", null, false],
  ["1510", "Computer Equipment", "asset", "1500", false],
  ["1520", "Office Furniture", "asset", "1500", false],
  ["2000", "Accounts Payable", "liability", null, true],
  ["2100", "Wallet Liability", "liability", null, true],
  ["2200", "Tax Payable", "liability", null, false],
  ["2300", "Deferred Revenue", "liability", null, false],
  ["2400", "Accrued Expenses", "liability", null, false],
  ["2500", "Customer Deposits", "liability", null, false],
  ["3000", "Owner's Equity", "equity", null, false],
  ["3100", "Retained Earnings", "equity", "3000", false],
  ["4000", "General Revenue", "revenue", null, true],
  ["4100", "Service Revenue", "revenue", "4000", true],
  ["4200", "Product Revenue", "revenue", "4000", true],
  ["4500", "Fee Income", "revenue", "4000", true],
  ["5100", "Cash Discount Expense", "expense", null, true],
  ["5200", "Bad Debt Expense", "expense", null, false],
  ["5300", "Bank Fees", "expense", null, false],
  ["6100", "Operating Expense", "expense", null, true],
  ["6110", "Payroll", "expense", "6100", false],
  ["6111", "Salaries", "expense", "6110", false],
  ["6112", "Benefits", "expense", "6110", false],
  ["6120", "Software & Hosting", "expense", "6100", false],
  ["6130", "Facilities", "expense", "6100", false],
  ["6140", "Travel", "expense", "6100", false],
];

const isDebitNormal = (type: AccountType): boolean =>
  type === "asset" || type === "expense";

const RETAINED = "3100";

export const genChartOfAccounts = (persona: Persona): FinanceAccount[] => {
  const rng = createRng(seedFor(persona, "finance.chartOfAccounts"));
  const parents = new Set(ACCOUNTS.map((a) => a[3]));
  const depthOf = (code: string): 0 | 1 | 2 => {
    const parent = ACCOUNTS.find((a) => a[0] === code)?.[3];
    if (!parent) return 0;
    return depthOf(parent) === 0 ? 1 : 2;
  };
  // Leaf balances, then the equity plug so the trial balance balances.
  const balances = new Map<string, number>();
  for (const [code, , type] of ACCOUNTS) {
    if (parents.has(code) || code === RETAINED) continue;
    const scale = type === "asset" ? 1.6 : 1;
    balances.set(
      code,
      round2(money(rng, chartOfAccountsShape, "balance") * scale),
    );
  }
  const sideTotal = (debit: boolean) =>
    ACCOUNTS.reduce(
      (sum, [code, , type]) =>
        isDebitNormal(type) === debit ? sum + (balances.get(code) ?? 0) : sum,
      0,
    );
  if (sideTotal(false) > sideTotal(true)) {
    balances.set(
      "1000",
      round2(
        (balances.get("1000") ?? 0) +
          sideTotal(false) -
          sideTotal(true) +
          25000,
      ),
    );
  }
  balances.set(RETAINED, round2(sideTotal(true) - sideTotal(false)));
  const rollup = (code: string): number => {
    const children = ACCOUNTS.filter((a) => a[3] === code);
    if (children.length === 0) return balances.get(code) ?? 0;
    return round2(children.reduce((sum, c) => sum + rollup(c[0]), 0));
  };
  const activeFlags = new Map(
    ACCOUNTS.map(([code]) => [
      code,
      rng.weighted(weights<string>(chartOfAccountsShape.enums, "active")) ===
        "yes",
    ]),
  );
  return ACCOUNTS.map(
    ([code, name, type, parentCode, system]): FinanceAccount => ({
      id: `account-${code}`,
      code,
      name,
      type,
      balance: rollup(code),
      depth: depthOf(code),
      parentCode,
      system,
      active: system || activeFlags.get(code) === true,
    }),
  );
};

/** Leaf accounts only (parents roll their children up), so debits equal credits. */
export const buildTrialBalance = (
  accounts: readonly FinanceAccount[],
): FinanceTrialBalance => {
  const parents = new Set(accounts.map((a) => a.parentCode));
  const rows = accounts
    .filter((a) => !parents.has(a.code))
    .map(
      (a): FinanceTrialBalanceRow => ({
        id: `trial-${a.code}`,
        code: a.code,
        name: a.name,
        debit: isDebitNormal(a.type) ? a.balance : 0,
        credit: isDebitNormal(a.type) ? 0 : a.balance,
      }),
    );
  return {
    rows,
    totalDebit: round2(rows.reduce((s, r) => s + r.debit, 0)),
    totalCredit: round2(rows.reduce((s, r) => s + r.credit, 0)),
  };
};

const DESCRIPTIONS: Record<string, readonly string[]> = {
  "1200": ["Customer invoice posted", "Receivable adjustment"],
  "2200": ["Sales tax on invoice", "Tax remittance accrual"],
  "4100": ["Service revenue recognised", "Service period billed"],
  "1000": ["Customer payment received", "Vendor bill payment"],
  "4500": ["Network fee income", "Late fee income"],
  "2000": ["Vendor bill recorded", "Vendor credit applied"],
  "6120": ["Hosting subscription", "Software licences"],
  "6130": ["Facilities charge", "Maintenance contract"],
  "6140": ["Travel expense", "Site visit mileage"],
};

export const genLedger = (persona: Persona): FinanceLedgerEntry[] => {
  const rng = createRng(seedFor(persona, "finance.ledger"));
  const tenant = tenantOf<"U1" | "F1" | "G1">(ledgerShape, persona.key);
  const window = ledgerWindow[tenant];
  const byCode = new Map(ACCOUNTS.map((a) => [a[0], a]));
  const rows = Array.from({ length: FINANCE_COUNTS.ledger }, () => {
    const code = rng.weighted(weights<string>(ledgerShape.enums, "account"));
    const [, name, type] = byCode.get(code) as (typeof ACCOUNTS)[number];
    const amount = money(rng, ledgerShape, "amount");
    // About 8% of lines post against the account's normal side (adjustments).
    const debit = isDebitNormal(type) !== rng.bool(0.08);
    return {
      date: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      description: `${rng.pick(DESCRIPTIONS[code] ?? ["Journal adjustment"])} ${rng.int(1000, 9999)}`,
      account: `${code} ${name}`,
      type,
      debit: debit ? amount : 0,
      credit: debit ? 0 : amount,
      status: rng.weighted(
        weights<FinanceLedgerEntry["status"]>(
          ledgerShape.enums,
          `status_${tenant}`,
        ),
      ),
    };
  });
  // Journal numbers and running balances follow date order.
  const running = new Map<string, number>();
  const ordered = byDateAsc(rows, (r) => r.date).map(
    ({ type, ...r }, i): FinanceLedgerEntry => {
      const next =
        (running.get(r.account) ?? 0) +
        (r.status === "posted"
          ? isDebitNormal(type)
            ? r.debit - r.credit
            : r.credit - r.debit
          : 0);
      running.set(r.account, round2(next));
      return {
        id: `ledger-${i + 1}`,
        journal: rng.reference("JE"),
        category: type,
        balance: round2(next),
        ...r,
      };
    },
  );
  return ordered.reverse();
};
