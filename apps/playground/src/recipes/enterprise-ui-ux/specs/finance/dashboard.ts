import { financeData } from "../../mock/finance.js";
import { ANCHOR } from "../../mock/random.js";
import { capitalise, compactMoney, DAY, daysAhead, money } from "./common.js";
import type { DashboardSpec, Persona } from "../types.js";

const closedInvoice = new Set(["draft", "paid", "void", "written_off"]);
const closedBill = new Set(["draft", "paid", "void", "rejected"]);

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    date,
  );

export const financeDashboard = (persona: Persona): DashboardSpec => {
  const data = financeData(persona);
  const format = money(persona);
  const openInvoices = data.invoices.filter(
    (row) => !closedInvoice.has(row.status) && row.balance > 0,
  );
  const openBills = data.bills.filter(
    (row) => !closedBill.has(row.status) && row.balance > 0,
  );
  const sum = (rows: { balance: number }[]) =>
    rows.reduce((total, row) => total + row.balance, 0);
  const dueSoon = (rows: { dueDate: Date; balance: number }[]) =>
    sum(
      rows.filter((row) => {
        const ahead = daysAhead(row.dueDate);
        return ahead >= 0 && ahead <= 30;
      }),
    );
  const collected = data.payments
    .filter(
      (row) =>
        row.direction === "in" &&
        row.status === "completed" &&
        ANCHOR.getTime() - row.date.getTime() <= 30 * DAY,
    )
    .reduce((total, row) => total + row.amount, 0);
  const withCustomer = data.invoices.filter((row) =>
    Boolean(row.customer),
  ).length;
  const health =
    data.invoices.length === 0
      ? 0
      : Math.round((withCustomer / data.invoices.length) * 100);

  const overdueDays = (due: Date) => -daysAhead(due);
  const buckets = [
    { label: "Current", test: (d: number) => d <= 0 },
    { label: "1–30 days", test: (d: number) => d > 0 && d <= 30 },
    { label: "31–60 days", test: (d: number) => d > 30 && d <= 60 },
    { label: "61–90 days", test: (d: number) => d > 60 && d <= 90 },
    { label: "90+ days", test: (d: number) => d > 90 },
  ].map((bucket) => ({
    label: bucket.label,
    amount: sum(
      openInvoices.filter((row) => bucket.test(overdueDays(row.dueDate))),
    ),
  }));
  const bucketMax = Math.max(1, ...buckets.map((bucket) => bucket.amount));

  const months = Array.from({ length: 6 }, (_, index) => {
    const end = new Date(
      Date.UTC(
        ANCHOR.getUTCFullYear(),
        ANCHOR.getUTCMonth() - (5 - index) + 1,
        0,
      ),
    );
    const amount = data.subscriptions
      .filter(
        (row) =>
          row.startDate.getTime() <= end.getTime() &&
          row.status !== "canceled" &&
          row.status !== "draft",
      )
      .reduce((total, row) => total + row.amount, 0);
    return { label: monthLabel(end), amount };
  });
  const mrrMax = Math.max(1, ...months.map((month) => month.amount));

  return {
    stats: [
      {
        label: "Receivable",
        value: compactMoney(sum(openInvoices)),
        hint: "Open invoice balances",
      },
      {
        label: "Payable",
        value: compactMoney(sum(openBills)),
        hint: "Open bill balances",
      },
      {
        label: "Collected this month",
        value: compactMoney(collected),
        hint: "Completed payments in, last 30 days",
      },
      {
        label: "Cash in 30 days",
        value: compactMoney(dueSoon(openInvoices) - dueSoon(openBills)),
        hint: "Receivable due minus payable due",
      },
      {
        label: "Data health",
        value: `${health}%`,
        hint: "Invoices with a customer",
      },
    ],
    panels: [
      {
        kind: "meters",
        title: "Aging",
        description: "Open invoice balance by days past due.",
        gap: "charts",
        meters: buckets.map((bucket) => ({
          label: bucket.label,
          value: bucket.amount,
          max: bucketMax,
          display: format.format(bucket.amount),
        })),
      },
      {
        kind: "table",
        title: "Bills to approve",
        description: "Bills waiting for review.",
        columns: [
          { key: "number", header: "Bill #", format: "link" },
          { key: "vendor", header: "Vendor", format: "party" },
          { key: "total", header: "Total", format: "money", align: "end" },
          { key: "dueDate", header: "Due", format: "date" },
        ],
        rows: data.bills
          .filter(
            (row) =>
              row.status === "pending_review" || row.status === "on_hold",
          )
          .slice(0, 6),
      },
      {
        kind: "table",
        title: "Recent payments",
        description: "The newest payments in and out.",
        columns: [
          { key: "date", header: "Date", format: "date" },
          { key: "party", header: "Party", format: "party" },
          { key: "amount", header: "Amount", format: "money", align: "end" },
          {
            key: "status",
            header: "Status",
            format: "status",
            accessor: (row) => capitalise(String(row.status)),
          },
        ],
        rows: [...data.payments]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 6),
      },
      {
        kind: "meters",
        title: "MRR trend",
        description: "Subscription amount in force, last six months.",
        gap: "charts",
        meters: months.map((month) => ({
          label: month.label,
          value: month.amount,
          max: mrrMax,
          display: format.format(month.amount),
        })),
      },
    ],
  };
};
