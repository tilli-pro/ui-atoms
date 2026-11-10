import { moneyFrom } from "./money.js";
import {
  address,
  cities,
  emailFor,
  organizationsByIndustry,
  personName,
  phone,
} from "./names.js";
import { createRng, type Rng, seedFor } from "./random.js";
import {
  accountsShape,
  companiesShape,
  contactsShape,
  exchangesShape,
  organizationsShape,
  preExchangesShape,
} from "./shapes/network.js";
import type { Persona, PersonaKey, Row } from "../specs/types.js";

export type NetworkFacetPerson = "customer" | "vendor" | "employee";
export type NetworkFacetOrg = "commercial" | "vendor" | "internal";
export type NetworkStatus = "connected" | "invited" | "not_invited";
export type ExchangeDirection = "inbound" | "outbound";
export type ExchangeStatus =
  | "business_accepted"
  | "expired"
  | "dead_letter"
  | "rejected"
  | "transport_delivered";
export type InviteStatus =
  | "created"
  | "sent"
  | "viewed"
  | "authenticated"
  | "claimed"
  | "expired"
  | "revoked"
  | "declined";
export type InvitePayment = "paid" | null;

type PartyColumns = {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  premiseAddress: string;
  balance: number;
  pastDueDate: Date | null;
  createdAt: Date;
};

export type NetworkContact = Row & PartyColumns & { facet: NetworkFacetPerson };

export type NetworkOrganization = Row &
  PartyColumns & {
    facet: NetworkFacetOrg;
    classification: string;
    industry: string;
    networkStatus: NetworkStatus;
  };

export type NetworkDirectoryCompany = Row & {
  displayName: string;
  legalName: string;
  industry: string;
  region: string;
  tradesWith: number;
  joinedAt: Date;
  isMine: boolean;
};

export type NetworkExchange = Row & {
  direction: ExchangeDirection;
  documentType: string;
  status: ExchangeStatus;
  partner: string;
  createdAt: Date;
};

export type NetworkInvite = Row & {
  recipient: string;
  status: InviteStatus;
  payment: InvitePayment;
  sentAt: Date;
};

export type NetworkData = {
  contacts: NetworkContact[];
  organizations: NetworkOrganization[];
  directory: NetworkDirectoryCompany[];
  exchanges: NetworkExchange[];
  invites: NetworkInvite[];
};

const COUNTS = {
  contacts: 48,
  organizations: 52,
  directory: 44,
  exchanges: 46,
  invites: 40,
} as const;

const SYNTHETIC_AWAITING_REVIEW = 6;

const ACCOUNT_PREFIX: Record<PersonaKey, string> = {
  utilities: "UTL",
  financial: "CON",
  government_federal: "GOV",
};

const LEGAL_SUFFIXES = ["Inc.", "LLC", "Corp.", "Group", "Holdings"] as const;

const DIRECTORY_INDUSTRIES = [
  "Real Estate",
  "Media",
  "Technology",
  "Education",
  "Legal Services",
  "Consulting",
  "Manufacturing",
  "Insurance",
  "Telecommunications",
  "Energy",
] as const;

const DIRECTORY_REGIONS = [
  "Northeast",
  "Southeast",
  "Midwest",
  "Southwest",
  "West Coast",
  "Mountain",
] as const;

const accountColumns = (
  rng: Rng,
  key: PersonaKey,
): Pick<PartyColumns, "accountNumber" | "balance" | "pastDueDate"> => {
  const numbers = accountsShape.numbers ?? {};
  const enums = accountsShape.enums;
  const window = accountsShape.dates ?? { fromDaysAgo: 51, toDaysAgo: 182 };
  const hasBalance =
    rng.weighted(
      enums[`balance_present_${key}`] as NonNullable<(typeof enums)[string]>,
    ) === "yes";
  const isPastDue =
    rng.weighted(
      enums[`past_due_${key}`] as NonNullable<(typeof enums)[string]>,
    ) === "yes";
  const pastDueRange = numbers[`pastDue_${key}`];
  const balanceRange = numbers[`balance_${key}`];
  const base = hasBalance && balanceRange ? moneyFrom(rng, balanceRange) : 0;
  // A zero balance carries no past-due amount or date.
  const pastDue =
    isPastDue && pastDueRange && base > 0 ? moneyFrom(rng, pastDueRange) : 0;
  const accountNumber =
    key === "utilities"
      ? `${ACCOUNT_PREFIX[key]}-${String(rng.int(0, 999_999_999_999)).padStart(12, "0")}`
      : `${ACCOUNT_PREFIX[key]}-${String(rng.int(0, 99_999)).padStart(5, "0")}`;
  return {
    accountNumber,
    balance: Math.max(base, pastDue),
    pastDueDate:
      pastDue > 0 ? rng.daysAgo(window.fromDaysAgo, window.toDaysAgo) : null,
  };
};

const partyDate = (
  rng: Rng,
  shape: { dates?: { fromDaysAgo: number; toDaysAgo: number } },
): Date => {
  const w = shape.dates ?? { fromDaysAgo: 4, toDaysAgo: 238 };
  return rng.daysAgo(w.fromDaysAgo, w.toDaysAgo);
};

const orgNamePool = (rng: Rng, key: PersonaKey, count: number): string[] => {
  const base = rng.shuffle(organizationsByIndustry[key]);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = base[i % base.length] as string;
    out.push(
      i < base.length
        ? name
        : `${name} ${LEGAL_SUFFIXES[i % LEGAL_SUFFIXES.length]}`,
    );
  }
  return out;
};

const genContacts = (persona: Persona): NetworkContact[] => {
  const rng = createRng(seedFor(persona, "network.contacts"));
  const orgs = organizationsByIndustry[persona.key];
  return Array.from({ length: COUNTS.contacts }, (_, i) => {
    const name = personName(rng);
    return {
      id: `contact-${i + 1}`,
      name,
      email: emailFor(name, rng.pick(orgs)),
      phone: phone(rng),
      premiseAddress: address(rng),
      ...accountColumns(rng, persona.key),
      createdAt: partyDate(rng, contactsShape),
      facet: rng.weighted(
        contactsShape.enums.facet as NonNullable<
          (typeof contactsShape.enums)[string]
        >,
      ) as NetworkFacetPerson,
    };
  });
};

const genOrganizations = (persona: Persona): NetworkOrganization[] => {
  const rng = createRng(seedFor(persona, "network.organizations"));
  const enums = organizationsShape.enums;
  const names = orgNamePool(rng, persona.key, COUNTS.organizations);
  const rows = names.map((name, i): NetworkOrganization => {
    const contact = personName(rng);
    return {
      id: `organization-${i + 1}`,
      name,
      email: emailFor(contact, name),
      phone: phone(rng),
      premiseAddress: address(rng),
      ...accountColumns(rng, persona.key),
      createdAt: partyDate(rng, organizationsShape),
      facet: rng.weighted(
        enums.facet as NonNullable<(typeof enums)[string]>,
      ) as NetworkFacetOrg,
      classification: rng.weighted(
        enums.classification as NonNullable<(typeof enums)[string]>,
      ),
      industry: rng.weighted(
        enums[`industry_${persona.key}`] as NonNullable<(typeof enums)[string]>,
      ),
      networkStatus: rng.weighted(
        enums[`networkStatus_${persona.key}`] as NonNullable<
          (typeof enums)[string]
        >,
      ) as NetworkStatus,
    };
  });
  // The profiled roster is under 1% connected: promote a few rows so the
  // Connected / Invited chips and the dashboard stats have content.
  const connected = rows.filter((r) => r.networkStatus === "connected").length;
  const invited = rows.filter((r) => r.networkStatus === "invited").length;
  let needConnected = Math.max(0, 3 - connected);
  let needInvited = Math.max(0, 4 - invited);
  for (const row of rows) {
    if (row.networkStatus !== "not_invited") continue;
    if (needConnected > 0) {
      row.networkStatus = "connected";
      needConnected--;
    } else if (needInvited > 0) {
      row.networkStatus = "invited";
      needInvited--;
    }
  }
  return rows;
};

const genDirectory = (persona: Persona): NetworkDirectoryCompany[] => {
  const rng = createRng(seedFor(persona, "network.directory"));
  const window = companiesShape.dates ?? { fromDaysAgo: 22, toDaysAgo: 60 };
  const names = orgNamePool(rng, persona.key, COUNTS.directory);
  const ownIndex = rng.int(0, names.length - 1);
  return names.map((displayName, i) => ({
    id: `company-${i + 1}`,
    displayName,
    legalName: `${displayName} ${rng.pick(LEGAL_SUFFIXES)}`,
    industry: rng.pick(DIRECTORY_INDUSTRIES),
    region: `${rng.pick(DIRECTORY_REGIONS)}, ${rng.pick(cities)}`,
    tradesWith: rng.int(1, 24),
    joinedAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    isMine: i === ownIndex,
  }));
};

const genExchanges = (persona: Persona): NetworkExchange[] => {
  const rng = createRng(seedFor(persona, "network.exchanges"));
  const enums = exchangesShape.enums;
  const window = exchangesShape.dates ?? { fromDaysAgo: 9, toDaysAgo: 122 };
  const partners = rng
    .shuffle(organizationsByIndustry[persona.key])
    .slice(0, 8);
  const pick = (name: string) =>
    rng.weighted(enums[name] as NonNullable<(typeof enums)[string]>);
  const regular = Array.from(
    { length: COUNTS.exchanges - SYNTHETIC_AWAITING_REVIEW },
    (_, i): NetworkExchange => ({
      id: `exchange-${i + 1}`,
      direction: pick("direction") as ExchangeDirection,
      documentType: pick("document_type"),
      status: pick("status") as ExchangeStatus,
      partner: rng.pick(partners),
      createdAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    }),
  );
  const awaiting = Array.from(
    { length: SYNTHETIC_AWAITING_REVIEW },
    (_, i): NetworkExchange => ({
      id: `exchange-review-${i + 1}`,
      direction: "inbound",
      documentType: pick("document_type"),
      status: "transport_delivered",
      partner: rng.pick(partners),
      createdAt: rng.daysAgo(0, 6),
    }),
  );
  return [...awaiting, ...regular].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
};

const genInvites = (persona: Persona): NetworkInvite[] => {
  const rng = createRng(seedFor(persona, "network.invites"));
  const enums = preExchangesShape.enums;
  const window = preExchangesShape.dates ?? { fromDaysAgo: 1, toDaysAgo: 40 };
  const orgs = organizationsByIndustry[persona.key];
  return Array.from(
    { length: COUNTS.invites },
    (_, i): NetworkInvite => ({
      id: `invite-${i + 1}`,
      recipient: emailFor(personName(rng), rng.pick(orgs)),
      status: rng.weighted(
        enums.status as NonNullable<(typeof enums)[string]>,
      ) as InviteStatus,
      payment:
        rng.weighted(enums.payment as NonNullable<(typeof enums)[string]>) ===
        "paid"
          ? "paid"
          : null,
      sentAt: rng.daysAgo(window.fromDaysAgo, window.toDaysAgo),
    }),
  ).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
};

const cache = new Map<PersonaKey, NetworkData>();

export const networkData = (persona: Persona): NetworkData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const data: NetworkData = {
    contacts: genContacts(persona),
    organizations: genOrganizations(persona),
    directory: genDirectory(persona),
    exchanges: genExchanges(persona),
    invites: genInvites(persona),
  };
  cache.set(persona.key, data);
  return data;
};
