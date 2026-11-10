import { moneyFrom } from "./money.js";
import {
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
  productsByIndustry,
} from "./names.js";
import { createRng, type Rng, seedFor } from "./random.js";
import {
  leadsCreatedWindow,
  leadsShape,
  opportunitiesCloseWindow,
  opportunitiesShape,
  ordersShape,
  type PipelineStage,
  pipelineStagesF1,
  quotesShape,
  quotesValidUntilWindow,
} from "./shapes/sales.js";
import type { Persona, PersonaKey, Row } from "../specs/types.js";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "converted";
export type LeadRating = "hot" | "warm" | "cold";
export type DealStatus = "open" | "won" | "lost";
export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";
export type OrderDirection = "sales" | "purchase" | "received";
export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "closed"
  | "cancelled"
  | "received";

export type SalesLead = Row & {
  name: string;
  company: string;
  /** Email, or a phone number when the lead has no email. */
  contact: string;
  source: string | null;
  status: LeadStatus;
  rating: LeadRating;
  estimatedValue: number | null;
  createdAt: Date;
};

export type SalesDeal = Row & {
  name: string;
  amount: number;
  /** Pipeline stage name (the financial tenant's 5 stages for every persona). */
  stage: string;
  /** 0-100. */
  probability: number;
  closeDate: Date;
  status: DealStatus;
  /** Organization name. */
  account: string;
  createdAt: Date;
};

export type SalesQuote = Row & {
  number: string;
  name: string;
  status: QuoteStatus;
  total: number;
  createdAt: Date;
  expiresAt: Date;
};

export type SalesOrder = Row & {
  number: string;
  direction: OrderDirection;
  /** "Sales order" or "Purchase order". */
  type: string;
  status: OrderStatus;
  createdVia: "manual" | "quote" | "network";
  date: Date;
  /** Customer (sales, received) or supplier (purchase) name. */
  party: string;
  total: number;
  invoiced: number;
  uninvoiced: number;
  currency: "USD";
};

export type SalesData = {
  leads: SalesLead[];
  deals: SalesDeal[];
  quotes: SalesQuote[];
  orders: SalesOrder[];
  /** The pipeline stages in force for this persona (financial 5, borrowed). */
  stages: readonly PipelineStage[];
};

const COUNTS = { leads: 52, deals: 56, quotes: 44, orders: 48 } as const;
/** Received-from-partners rows inside the orders set. */
const RECEIVED_ORDERS = 8;

type Tenant = "F1" | "G1";

const tenantOf = (
  shape: { source: Record<PersonaKey, { tenant: string }> },
  key: PersonaKey,
): Tenant => (shape.source[key].tenant === "G1" ? "G1" : "F1");

const weights = (
  enums: Record<string, readonly (readonly [string, number])[]>,
  name: string,
) => enums[name] as NonNullable<(typeof enums)[string]>;

const numberRange = (
  numbers:
    | Record<string, { min: number; median: number; max: number }>
    | undefined,
  name: string,
) => (numbers ?? {})[name] as { min: number; median: number; max: number };

const money = (
  rng: Rng,
  shape: { numbers?: Parameters<typeof numberRange>[0] },
  name: string,
) => moneyFrom(rng, numberRange(shape.numbers, name));

const genLeads = (persona: Persona): SalesLead[] => {
  const rng = createRng(seedFor(persona, "sales.leads"));
  const tenant = tenantOf(leadsShape, persona.key);
  const enums = leadsShape.enums;
  const window = leadsCreatedWindow[tenant];
  const orgs = organizationsByIndustry[persona.key];
  return Array.from({ length: COUNTS.leads }, (_, i): SalesLead => {
    const name = personName(rng);
    const company = rng.pick(orgs);
    const source = rng.weighted(weights(enums, `source_${tenant}`));
    const hasValue =
      rng.weighted(weights(enums, `estimated_value_null_${tenant}`)) ===
      "present";
    return {
      id: `lead-${i + 1}`,
      name,
      company,
      // Email on ~90% of rows (267/296), phone otherwise.
      contact: rng.bool(0.9) ? emailFor(name, company) : phone(rng),
      source: source === "none" ? null : source,
      status: rng.weighted(weights(enums, `status_${tenant}`)) as LeadStatus,
      rating: rng.weighted(weights(enums, `rating_${tenant}`)) as LeadRating,
      estimatedValue: hasValue
        ? money(rng, leadsShape, `estimated_value_${tenant}`)
        : null,
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const genDeals = (persona: Persona): SalesDeal[] => {
  const rng = createRng(seedFor(persona, "sales.deals"));
  const tenant = tenantOf(opportunitiesShape, persona.key);
  const enums = opportunitiesShape.enums;
  const window = opportunitiesShape.dates ?? {
    fromDaysAgo: 27,
    toDaysAgo: 122,
  };
  const close = opportunitiesCloseWindow[tenant];
  const orgs = organizationsByIndustry[persona.key];
  const products = productsByIndustry[persona.key];
  const stageByName = new Map(pipelineStagesF1.map((s) => [s.name, s]));
  return Array.from({ length: COUNTS.deals }, (_, i): SalesDeal => {
    const account = rng.pick(orgs);
    const status = rng.weighted(
      weights(enums, `status_${tenant}`),
    ) as DealStatus;
    const stageName =
      status === "won"
        ? "Closed Won"
        : status === "lost"
          ? "Closed Lost"
          : rng.weighted(weights(enums, "open_stage_F1"));
    const stage = stageByName.get(stageName) as PipelineStage;
    return {
      id: `deal-${i + 1}`,
      name: `${rng.pick(products)} — ${account}`,
      amount: money(rng, opportunitiesShape, `amount_${tenant}`),
      stage: stage.name,
      probability: stage.probability,
      // Closed deals closed in the past; open deals are expected ahead.
      closeDate:
        status === "open"
          ? rng.daysAhead(0, close.aheadDays)
          : rng.daysAgo(0, close.agoDays),
      status,
      account,
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const genQuotes = (persona: Persona): SalesQuote[] => {
  const rng = createRng(seedFor(persona, "sales.quotes"));
  const window = quotesShape.dates ?? { fromDaysAgo: 27, toDaysAgo: 122 };
  const products = productsByIndustry[persona.key];
  return Array.from({ length: COUNTS.quotes }, (_, i): SalesQuote => {
    const status = rng.weighted(
      weights(quotesShape.enums, "status"),
    ) as QuoteStatus;
    const number = rng.reference("Q");
    return {
      id: `quote-${i + 1}`,
      number,
      name: `${number} — ${rng.pick(products)} quote`,
      status,
      total: money(rng, quotesShape, "total"),
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      // Expired quotes lapsed already; the rest run out within the next weeks.
      expiresAt:
        status === "expired"
          ? rng.daysAgo(1, quotesValidUntilWindow.agoDays)
          : rng.daysAhead(0, quotesValidUntilWindow.aheadDays),
    };
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const genOrders = (persona: Persona): SalesOrder[] => {
  const rng = createRng(seedFor(persona, "sales.orders"));
  const enums = ordersShape.enums;
  const window = ordersShape.dates ?? { fromDaysAgo: 7, toDaysAgo: 27 };
  const parties = organizationsByIndustry[persona.key];
  const regularCount = COUNTS.orders - RECEIVED_ORDERS;
  const rows = Array.from({ length: COUNTS.orders }, (_, i): SalesOrder => {
    const received = i >= regularCount;
    const direction: OrderDirection = received
      ? "received"
      : (rng.weighted(weights(enums, "direction")) as "sales" | "purchase");
    const isPurchase = direction === "purchase";
    const status: OrderStatus = received
      ? "received"
      : (rng.weighted(
          weights(enums, isPurchase ? "status_purchase" : "status_sales"),
        ) as OrderStatus);
    const total = money(
      rng,
      ordersShape,
      isPurchase ? "total_purchase" : "total_sales",
    );
    // Invoiced/billed derive from the order_documents link: closed orders are
    // fully invoiced, ~8% (partially_invoiced) of live ones partly, the rest none.
    const partial =
      rng.weighted(weights(enums, "billing_state")) === "partially_invoiced";
    const invoiced =
      status === "closed"
        ? total
        : partial && (status === "confirmed" || status === "submitted")
          ? Math.round(
              total * rng.range({ min: 0.3, median: 0.5, max: 0.7 }) * 100,
            ) / 100
          : 0;
    const open =
      status !== "cancelled" && status !== "draft" && status !== "received";
    const createdVia: SalesOrder["createdVia"] = received
      ? "network"
      : (rng.weighted(weights(enums, "created_via")) as "manual" | "quote");
    return {
      // Received rows are partners' orders to this tenant: sales orders for it.
      id: `order-${i + 1}`,
      number: rng.reference(isPurchase ? "PO" : "SO"),
      direction,
      type: isPurchase ? "Purchase order" : "Sales order",
      status,
      createdVia,
      date: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      party: rng.pick(parties),
      total,
      invoiced,
      uninvoiced: open ? Math.round((total - invoiced) * 100) / 100 : 0,
      currency: persona.currency,
    };
  });
  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const cache = new Map<PersonaKey, SalesData>();

export const salesData = (persona: Persona): SalesData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const data: SalesData = {
    leads: genLeads(persona),
    deals: genDeals(persona),
    quotes: genQuotes(persona),
    orders: genOrders(persona),
    stages: pipelineStagesF1,
  };
  cache.set(persona.key, data);
  return data;
};
