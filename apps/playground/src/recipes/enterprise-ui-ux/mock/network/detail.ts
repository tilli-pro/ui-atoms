import { money, round2, weights } from "../common.js";
import {
  address,
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
} from "../names.js";
import {
  ACCOUNT_PREFIX,
  type NetworkContact,
  type NetworkOrganization,
} from "../network.js";
import { createRng, seedFor } from "../random.js";
import { accountsShape, organizationsShape } from "../shapes/network.js";
import {
  BILLING_RATE,
  CONTACT_HAS_ACCOUNT_RATE,
  CONTACT_HAS_ORG_RATE,
  DEPARTMENT_RATE,
  DUPLICATE_RATE,
  MAILING_RATE,
  MOBILE_RATE,
  ORG_HAS_WEBSITE_RATE,
  partyDetailShape,
  TITLE_RATE,
  TWO_ACCOUNTS_RATE,
  VERIFIED_RATE,
} from "../shapes/party-detail.js";
import {
  buildTimeline,
  genInteractions,
  genInvoices,
  genPayments,
  genTickets,
} from "./detail-related.js";
import type { Persona, Row, TimelineEvent } from "../../specs/types.js";

export type Verif = "verified" | "unverified" | "unset";
export type ProfileAddress = {
  type: "service" | "mailing" | "billing";
  line: string;
  primary: boolean;
};
export type ProfileMethod = {
  type: "email" | "phone" | "mobile" | "whatsapp";
  value: string;
  primary: boolean;
  verified: boolean;
};
export type ProfileInvoice = Row & {
  number: string;
  status: string;
  issueDate: Date;
  dueDate: Date;
  total: number;
  balance: number;
};
export type ProfilePayment = Row & {
  date: Date;
  document: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
};
export type ProfileTicket = Row & {
  number: string;
  subject: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: Date;
};
export type ProfileInteraction = Row & {
  type: string;
  direction: string;
  status: string;
  fromTo: string;
  agent: string;
  startedAt: Date;
  durationMinutes: number | null;
};
export type ProfileAccount = Row & {
  number: string;
  type: string;
  status: string;
  balance: number;
  pastDue: number;
};
export type ProfileContact = Row & {
  name: string;
  title: string | null;
  email: string;
  phone: string;
  createdAt: Date;
};
export type ProfileOrganization = Row & {
  name: string;
  industry: string;
  networkStatus: string;
  facet: string;
};

export type PartyDetail = {
  row: NetworkContact | NetworkOrganization;
  kind: "contact" | "organization";
  source: "Beacon" | "SAP" | "Oracle";
  isTenant: boolean;
  lastSyncedAt: Date;
  title?: string;
  department?: string;
  website?: string;
  customFields: Record<string, string>;
  addresses: ProfileAddress[];
  methods: ProfileMethod[];
  preferences: {
    email: Verif;
    sms: Verif;
    whatsapp: Verif;
    ebill: boolean;
    language: string;
  };
  account: {
    numbers: string[];
    status: string;
    balance: number;
    pastDue: number;
    dueDate: Date | null;
    lastPayment: { amount: number; at: Date } | null;
    averageMonthlyBill: number;
    programs:
      | {
          kind: "utility";
          budgetBilling: boolean;
          paymentArrangement: boolean;
          disconnectProtection: boolean;
        }
      | {
          kind: "government";
          filingStatus: string;
          paymentPlan: string;
          compliance: string;
        };
    types: string[];
  };
  supplier?: {
    number: string;
    tier: string;
    status: string;
    description: string;
    spend: {
      ytd: number;
      variancePct: number;
      openPoAmount: number;
      openPoCount: number;
      pendingInvoices: number;
    };
  };
  paymentInstruments: { label: string; type: string; isDefault: boolean }[];
  payout: { status: string; recipientId: string } | null;
  social: { platform: string; candidates: number; confidence: number }[];
  fingerprints: { sessions: number; pageViews: number; devices: number };
  duplicates: {
    name: string;
    email: string;
    signals: string;
    confidence: number;
  }[];
  invoices: ProfileInvoice[];
  payments: ProfilePayment[];
  tickets: ProfileTicket[];
  interactions: ProfileInteraction[];
  organizations: ProfileOrganization[];
  contacts: ProfileContact[];
  accounts: ProfileAccount[];
  timeline: TimelineEvent[];
};

const TITLES = [
  "Account Manager",
  "Finance Director",
  "Operations Lead",
  "Procurement Officer",
  "Office Manager",
  "Controller",
  "Facilities Manager",
  "Billing Specialist",
  "Project Manager",
  "Owner",
  "Customer Success Lead",
  "Compliance Officer",
] as const;

const DEPARTMENTS = [
  "Finance",
  "Operations",
  "Procurement",
  "Facilities",
  "Sales",
  "Legal",
  "IT",
  "Administration",
] as const;

const PLATFORMS = ["linkedin", "x", "facebook", "instagram"] as const;
const FILING = ["Current", "Late", "Exempt"] as const;
const PLAN = ["None", "Installments"] as const;
const COMPLIANCE = ["Compliant", "Under review"] as const;
const SLUG_STRIP = /[^a-z0-9]+/g;

const slug = (value: string): string =>
  value.toLowerCase().replace(SLUG_STRIP, "");

const PERSONA_EXTRA = {
  utilities: "preferredLanguage",
  financial: "quickbooksId",
  government_federal: "qaGovPayerKey",
} as const;

export const partyDetail = (
  row: NetworkContact | NetworkOrganization,
  persona: Persona,
): PartyDetail => {
  const rng = createRng(seedFor(persona, `detail:${row.id}`));
  const key = persona.key;
  const org = "networkStatus" in row ? row : null;
  const kind = org ? "organization" : "contact";
  const enums = partyDetailShape.enums;
  const syncWindow = partyDetailShape.dates ?? {
    fromDaysAgo: 1,
    toDaysAgo: 60,
  };

  const source = rng.weighted(weights<PartyDetail["source"]>(enums, "source"));
  const customFields: Record<string, string> = {};
  if (source !== "Beacon") {
    customFields[source === "SAP" ? "sap_s4hanaId" : "oracle_ccnbId"] = String(
      rng.int(10_000_000, 99_999_999),
    );
  }
  if (rng.bool(0.34)) customFields.description = `Imported ${kind} record`;
  customFields[PERSONA_EXTRA[key]] =
    key === "utilities"
      ? rng.weighted(weights(enums, "language"))
      : `${slug(row.name).slice(0, 6)}-${rng.int(1000, 9999)}`;

  const isTenant = org ? rng.bool(0.05) : false;
  const lastSyncedAt =
    source !== "Beacon"
      ? rng.daysAgo(syncWindow.fromDaysAgo, syncWindow.toDaysAgo)
      : row.createdAt;

  const title = !org && rng.bool(TITLE_RATE) ? rng.pick(TITLES) : undefined;
  const department =
    !org && rng.bool(DEPARTMENT_RATE) ? rng.pick(DEPARTMENTS) : undefined;
  const website =
    org && rng.bool(ORG_HAS_WEBSITE_RATE)
      ? `https://${slug(row.name)}.example.com`
      : undefined;

  const addresses: ProfileAddress[] = [
    { type: "service", line: row.premiseAddress, primary: true },
  ];
  if (rng.bool(MAILING_RATE)) {
    addresses.push({ type: "mailing", line: address(rng), primary: false });
  }
  if (rng.bool(BILLING_RATE)) {
    addresses.push({ type: "billing", line: address(rng), primary: false });
  }

  const method = (
    type: ProfileMethod["type"],
    value: string,
    primary: boolean,
  ): ProfileMethod => ({
    type,
    value,
    primary,
    verified: rng.bool(VERIFIED_RATE),
  });
  const methods: ProfileMethod[] = [
    method("email", row.email, true),
    method("phone", row.phone, false),
  ];
  if (rng.bool(MOBILE_RATE)) methods.push(method("mobile", phone(rng), false));
  if (rng.bool(0.1)) methods.push(method("whatsapp", phone(rng), false));
  const verif = (types: ProfileMethod["type"][]): Verif => {
    const found = methods.find((m) => types.includes(m.type));
    return found ? (found.verified ? "verified" : "unverified") : "unset";
  };
  const preferences = {
    email: verif(["email"]),
    sms: verif(["mobile", "phone"]),
    whatsapp: verif(["whatsapp"]),
    ebill: rng.bool(0.4),
    language: rng.weighted(weights(enums, "language")),
  };

  const hasAccount = org ? true : rng.bool(CONTACT_HAS_ACCOUNT_RATE);
  const numbers = hasAccount ? [row.accountNumber] : [];
  if (hasAccount && rng.bool(TWO_ACCOUNTS_RATE)) {
    numbers.push(`${ACCOUNT_PREFIX[key]}-${rng.int(10_000, 99_999)}`);
  }
  const balance = hasAccount ? row.balance : 0;
  // Utilities has no pastDue range: its past due stays 0.
  const hasPastDueRange = (accountsShape.numbers ?? {})[`pastDue_${key}`];
  const pastDue =
    hasAccount && row.pastDueDate && hasPastDueRange
      ? Math.min(money(rng, accountsShape, `pastDue_${key}`), balance)
      : 0;
  const dueDate = hasAccount
    ? (row.pastDueDate ?? (balance > 0 ? rng.daysAhead(3, 28) : null))
    : null;
  const status = pastDue > 0 ? "Past due" : balance > 0 ? "Active" : "Current";

  const invoices = genInvoices(rng, persona);
  const payments = genPayments(rng, persona, invoices);
  const tickets = genTickets(rng, persona);
  const interactions = genInteractions(rng, row.phone);

  const lastPayment =
    (balance > 0 || invoices.some((i) => i.status === "paid")) && rng.bool(0.7)
      ? {
          amount: payments[0]?.amount ?? round2(Math.max(balance, 1) * 0.5),
          at: payments[0]?.date ?? rng.daysAgo(1, 90),
        }
      : null;
  const averageMonthlyBill = hasAccount
    ? money(rng, partyDetailShape, "average_monthly_bill")
    : 0;
  const programs: PartyDetail["account"]["programs"] =
    key === "government_federal"
      ? {
          kind: "government",
          filingStatus: rng.pick(FILING),
          paymentPlan: rng.pick(PLAN),
          compliance: rng.pick(COMPLIANCE),
        }
      : {
          kind: "utility",
          budgetBilling: rng.bool(0.3),
          paymentArrangement: rng.bool(0.3),
          disconnectProtection: rng.bool(0.3),
        };
  const accountType =
    row.facet === "commercial"
      ? "customer"
      : row.facet === "internal"
        ? "unclassified"
        : row.facet;
  const accountTypes = [accountType];
  if (rng.bool(0.1)) accountTypes.push(org ? "internal" : "household");

  const supplier =
    org && org.facet === "vendor"
      ? {
          number: `SUP-${rng.int(10_000, 99_999)}`,
          tier: rng.weighted(weights(enums, "supplier_tier")),
          status: rng.weighted(weights(enums, "supplier_status")),
          description: `${org.industry} supplier`,
          spend: {
            ytd: money(rng, partyDetailShape, "spend_ytd"),
            variancePct: rng.int(-15, 15),
            openPoAmount: round2(
              money(rng, partyDetailShape, "average_monthly_bill") * 6,
            ),
            openPoCount: rng.int(0, 6),
            pendingInvoices: rng.int(0, 5),
          },
        }
      : undefined;

  const paymentInstruments = Array.from({ length: rng.int(0, 3) }, (_, i) => {
    const type = rng.weighted(weights(enums, "instrument_type"));
    const last4 = String(rng.int(1000, 9999));
    return {
      label:
        type === "card"
          ? `Visa ···· ${last4}`
          : type === "ach"
            ? `Checking ···· ${last4}`
            : `Wire ···· ${last4}`,
      type,
      isDefault: i === 0,
    };
  });
  const payout = rng.bool(0.25)
    ? { status: "Enrolled", recipientId: `RCP-${rng.int(100_000, 999_999)}` }
    : null;
  const social = rng
    .shuffle(PLATFORMS)
    .slice(0, rng.int(0, 3))
    .map((platform) => ({
      platform: platform as string,
      candidates: rng.int(1, 5),
      confidence: Math.round(money(rng, partyDetailShape, "confidence")),
    }));
  const fingerprints = {
    sessions: rng.int(0, 40),
    pageViews: rng.int(0, 400),
    devices: rng.int(0, 3),
  };
  const duplicates = rng.bool(DUPLICATE_RATE)
    ? Array.from({ length: rng.int(1, 2) }, () => {
        const name = org
          ? rng.pick(organizationsByIndustry[key])
          : personName(rng);
        return {
          name,
          email: emailFor(personName(rng), name),
          signals: rng.weighted(weights(enums, "duplicate_signal")),
          confidence: Math.round(money(rng, partyDetailShape, "confidence")),
        };
      })
    : [];

  const organizations: ProfileOrganization[] =
    !org && row.facet !== "employee" && rng.bool(CONTACT_HAS_ORG_RATE)
      ? [
          {
            id: `org-${row.id}`,
            name: rng.pick(organizationsByIndustry[key]),
            industry: rng.weighted(
              weights(organizationsShape.enums, `industry_${key}`),
            ),
            networkStatus: rng.weighted(
              weights(organizationsShape.enums, `networkStatus_${key}`),
            ),
            facet: rng.weighted(weights(organizationsShape.enums, "facet")),
          },
        ]
      : [];
  const contacts: ProfileContact[] = org
    ? Array.from(
        { length: Number(rng.weighted(weights(enums, "contacts_per_org"))) },
        (_, i) => {
          const name = personName(rng);
          return {
            id: `contact-${i}`,
            name,
            title: rng.bool(TITLE_RATE) ? rng.pick(TITLES) : null,
            email: emailFor(name, row.name),
            phone: phone(rng),
            createdAt: rng.daysAgo(4, 238),
          };
        },
      )
    : [];
  const accounts: ProfileAccount[] = numbers.map((number, i) => ({
    id: `account-${i}`,
    number,
    type: accountType,
    status,
    balance: i === 0 ? balance : 0,
    pastDue: i === 0 ? pastDue : 0,
  }));

  const timeline = buildTimeline(
    rng,
    { invoices, payments, tickets, interactions, source, lastSyncedAt },
    row.createdAt,
  );

  return {
    row,
    kind,
    source,
    isTenant,
    lastSyncedAt,
    ...(title ? { title } : {}),
    ...(department ? { department } : {}),
    ...(website ? { website } : {}),
    customFields,
    addresses,
    methods,
    preferences,
    account: {
      numbers,
      status,
      balance,
      pastDue,
      dueDate,
      lastPayment,
      averageMonthlyBill,
      programs,
      types: accountTypes,
    },
    ...(supplier ? { supplier } : {}),
    paymentInstruments,
    payout,
    social,
    fingerprints,
    duplicates,
    invoices,
    payments,
    tickets,
    interactions,
    organizations,
    contacts,
    accounts,
    timeline,
  };
};
