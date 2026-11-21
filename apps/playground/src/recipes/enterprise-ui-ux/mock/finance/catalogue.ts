import { organizationsByIndustry, productsByIndustry } from "../names.js";
import { createRng, seedFor } from "../random.js";
import {
  FINANCE_COUNTS,
  productsShape,
  rateCardsShape,
  subscriptionNextBillAheadDays,
  subscriptionsCreatedWindow,
  subscriptionsShape,
} from "../shapes/finance.js";
import {
  byDateAsc,
  money,
  numberRange,
  partyName,
  plusDays,
  tenantOf,
  weights,
} from "./common.js";
import type { Persona, Row } from "../../specs/types.js";

export type FinanceProduct = Row & {
  name: string;
  type: "product" | "service" | "plan";
  source: string;
  category: "revenue" | "expense" | "both";
  sku: string | null;
  defaultPrice: number;
  status: "active" | "archived";
  /** Empty when the product has no description. */
  description: string;
  /** Units in stock; null for services and plans. */
  stock: number | null;
};

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "paused"
  | "draft";

export type FinanceSubscription = Row & {
  /** `SUB-NNNNN`, numbered in start-date order. */
  number: string;
  customer: string;
  /** A product name from `products`. */
  plan: string;
  status: SubscriptionStatus;
  billing: "monthly" | "annual";
  billingMode: "anniversary" | "calendar";
  createdAt: Date;
  startDate: Date;
  /** After the anchor; null for canceled and draft subscriptions. */
  nextBill: Date | null;
  amount: number;
};

export type FinanceRateCard = Row & {
  name: string;
  currency: "USD";
  /** Rate per unit, 20-120 with 4 decimals. */
  rate: number;
  kind: "bill" | "cost";
  appliesTo: "Customer" | "Tenant default" | "Staff";
  effectiveFrom: Date;
  /** Null for open-ended cards. */
  effectiveTo: Date | null;
  status: "active" | "scheduled" | "expired";
};

const VARIANTS = ["Standard", "Plus", "Premium", "Basic", "Annual", "Select"];

export const genProducts = (persona: Persona): FinanceProduct[] => {
  const rng = createRng(seedFor(persona, "finance.products"));
  const tenant = tenantOf<"U1" | "F1">(productsShape, persona.key);
  const enums = productsShape.enums;
  const base = productsByIndustry[persona.key];
  const used = new Set<string>();
  return Array.from({ length: FINANCE_COUNTS.products }, (_, i) => {
    const type = rng.weighted(
      weights<FinanceProduct["type"]>(enums, `type_${tenant}`),
    );
    let name = rng.pick(base);
    if (type === "plan" && !name.endsWith("Plan")) name = `${name} Plan`;
    // Keep names unique by adding a tier.
    for (let tries = 0; used.has(name) && tries < 12; tries++) {
      name = `${rng.pick(base)} ${rng.pick(VARIANTS)}`;
    }
    used.add(name);
    return {
      id: `product-${i + 1}`,
      name,
      type,
      source: rng.weighted(weights<string>(enums, "source")),
      category: rng.weighted(
        weights<FinanceProduct["category"]>(enums, "category"),
      ),
      sku:
        rng.weighted(weights<string>(enums, "has_sku")) === "yes"
          ? `SKU-${rng.int(1000, 9999)}`
          : null,
      defaultPrice: money(rng, productsShape, `default_price_${tenant}`),
      status: rng.weighted(
        weights<FinanceProduct["status"]>(enums, `status_${tenant}`),
      ),
      description:
        rng.weighted(weights<string>(enums, "has_description")) === "yes"
          ? `${name}, billed per the standard rate schedule.`
          : "",
      stock:
        type === "product"
          ? Math.round(rng.range(numberRange(productsShape, "stock")))
          : null,
    };
  });
};

export const genSubscriptions = (
  persona: Persona,
  products: readonly FinanceProduct[],
): FinanceSubscription[] => {
  const rng = createRng(seedFor(persona, "finance.subscriptions"));
  const tenant = tenantOf<"U1" | "F1">(subscriptionsShape, persona.key);
  const enums = subscriptionsShape.enums;
  const window = subscriptionsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.subscriptions }, () => {
    const status = rng.weighted(
      weights<SubscriptionStatus>(enums, `status_${tenant}`),
    );
    const isPerson =
      rng.weighted(weights<string>(enums, "customer_kind")) === "contact";
    return {
      customer: isPerson ? partyName(rng, { ...persona }) : rng.pick(orgs),
      plan: rng.pick(products).name,
      status,
      billing: rng.weighted(weights<"monthly" | "annual">(enums, "billing")),
      billingMode: rng.weighted(
        weights<"anniversary" | "calendar">(enums, "billing_mode"),
      ),
      createdAt: rng.daysAgo(
        subscriptionsCreatedWindow.fromDaysAgo,
        subscriptionsCreatedWindow.toDaysAgo,
      ),
      startDate: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
      nextBill:
        status === "canceled" || status === "draft"
          ? null
          : rng.daysAhead(1, subscriptionNextBillAheadDays),
      amount: money(rng, subscriptionsShape, "amount"),
    };
  });
  return byDateAsc(rows, (r) => r.startDate)
    .map(
      (r, i): FinanceSubscription => ({
        id: `subscription-${i + 1}`,
        number: rng.reference("SUB"),
        ...r,
      }),
    )
    .reverse();
};

const CARD_NAMES = [
  "Standard Labour",
  "After-hours Labour",
  "Field Technician",
  "Contractor",
  "Emergency Call-out",
  "Consulting",
  "Travel and Mileage",
  "Equipment Hire",
];

export const genRateCards = (persona: Persona): FinanceRateCard[] => {
  const rng = createRng(seedFor(persona, "finance.rateCards"));
  const window = rateCardsShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const orgs = organizationsByIndustry[persona.key];
  const rows = Array.from({ length: FINANCE_COUNTS.rateCards }, (_, i) => {
    const status = rng.weighted(
      weights<FinanceRateCard["status"]>(rateCardsShape.enums, "status"),
    );
    const kind = rng.weighted(
      weights<"bill" | "cost">(rateCardsShape.enums, "kind"),
    );
    const effectiveFrom =
      status === "scheduled"
        ? rng.daysAhead(1, 60)
        : rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
    return {
      id: `rate-card-${i + 1}`,
      name: `${rng.pick(CARD_NAMES)} - ${rng.pick(orgs)}`,
      currency: persona.currency,
      rate: rng.range(numberRange(rateCardsShape, "rate"), 4),
      kind,
      appliesTo:
        kind === "cost"
          ? ("Staff" as const)
          : rng.weighted(
              weights<"Customer" | "Tenant default">(
                rateCardsShape.enums,
                "applies_bill",
              ),
            ),
      effectiveFrom,
      // Expired cards ended after they started and before the anchor.
      effectiveTo:
        status === "expired"
          ? plusDays(effectiveFrom, rng.int(30, 120), true)
          : null,
      status,
    };
  });
  return rows.sort(
    (a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime(),
  );
};
