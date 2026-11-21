# Contact and organization profiles (recipe 1.3.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first resource pages to the `enterprise-ui-ux` playground recipe: a contact profile and an organization profile reached from the name link in the Network lists, on a reusable `DetailSpec` contract and `DetailView`, fed by a per-party seeded generator, persona-switchable, with every ui-atoms gap badged.

**Architecture:** The recipe's spec-driven mock layer grows one contract (`DetailSpec<R, D>` beside `ListSpec`), one view pair (`views/detail-view.tsx` shell, `views/detail-tabs.tsx` tab renderers), one generator (`mock/network/detail.ts` with its shape file) and one spec file (`specs/network/detail.tsx`, a factory shared by contact and organization). Routing gains a third hash segment; `index.tsx` resolves it to a row and renders `DetailView` when the item's list spec has a `detail`. Nothing in the other modules changes.

**Tech Stack:** React 19, `@tilli.dev/ui-atoms` subpaths (new: `alert`, `breadcrumb`, `tabs`, `timeline`), `lucide-react`, TypeScript, Vite playground, Biome, Playwright (from `apps/storybook`) for the headless check. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-12-party-detail-design.md` (this plan argues from it; §5 layout, §6 data, §7 terms, §8 gaps). Its parent `2026-11-10-enterprise-mocks-design.md` still governs personas, privacy and gap badges.

## Global Constraints

- **No recipe tests, ever** (root `CLAUDE.md`). Verification is `pnpm --filter playground lint`, `typecheck`, `build`, the root `pnpm test` (registry tests must keep passing), and the browser or script check each task names.
- Use Node 22.22.2: `export PATH=$HOME/.nvm/versions/node/v22.22.2/bin:$PATH` first in every shell. Build ui-atoms before the playground if `packages/ui-atoms/dist` is stale: `pnpm --filter @tilli.dev/ui-atoms build`.
- Compose from `@tilli.dev/ui-atoms/<subpath>` only, plus `@tilli.dev/ui-atoms/utils` (`cn`), `lucide-react`, `Intl`. Do not import `calendar`, `tree`, `carousel`, `resizable`.
- Mock data is invented: no QA names, emails, phones, addresses or tenant names. Shape files carry aggregates only. Dates are relative to `ANCHOR` (`mock/random.ts`); generators are deterministic per persona seed.
- Contract rules from the 1.2.0 run ledger: every `Label` resolves through `resolveLabel`; no `as never`; each gap id appears once per page-level `gaps` list; segments are authoritative for their own columns and actions.
- Biome: run `pnpm lint:fix` at the repo root before each verification; `useTopLevelRegex` and `useTemplate` are errors (hoist regex literals to module constants; template literals over concatenation). Local imports use the `.js` suffix.
- Registry rule: `recipes.json` `components` equals the exact set of `@tilli.dev/ui-atoms/<x>` subpaths imported anywhere in the recipe folder (`utils` excluded). Version becomes `1.3.0` with a dated changelog entry (Task 7 only; intermediate tasks leave `recipes.json` alone, so the catalog test may fail between Tasks 3 and 7 on `components`; each task's own verification is lint, typecheck and build, and Task 7 restores the registry).
- Commit messages: conventional, no attribution trailer. Per-task commits on `feat/version-1.1.0`.
- Row ids are `contact-<n>` and `organization-<n>` (`mock/network.ts`), identical across personas, so a persona switch on an open profile keeps the id valid and re-renders the profile for the new persona's row.

## Review Focus

Inputs the spec implies but no automated test exercises; each is pinned to a verification step in the task that owns it.

1. **A profile with zero related records** (Task 5 script, Task 6 browser): every table segment shows its `Empty` copy and the Activity timeline shows the two system events only, never a blank card.
2. **Persona switch on an open profile** (Task 6): the profile re-renders for the new persona's row with the same id, the active tab resets to the first, and government labels (Address, Risk flags, Statements, Service Requests) appear.
3. **Header row at 1024 wide with the inset sidebar** (Task 7): badges and buttons wrap, `scrollWidth === innerWidth`, no horizontal scroll on either profile.
4. **Duplicate alert share** (Task 2 script): roughly 12% of profiles carry the alert, never all and never none across 48 contacts.
5. **Stale id** (Task 6): `#/network/contacts/contact-999` renders the contacts list, no error.

---

### Task 1: Contract types, gap ids and persona terms

**Files:**
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/specs/types.ts`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/gaps.ts`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/personas.ts`

**Interfaces:**
- Produces: the types below, consumed by Tasks 2–6 verbatim.

- [ ] **Step 1: Add the detail contract to `specs/types.ts`** (after `EmptyCopy`, before `SegmentSpec`):

```ts
export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
export type BadgeSpec = { label: Label; tone?: BadgeTone };

/** One key/value on a profile; `format` reuses the table cell renderer. */
export type Field = {
  label: Label;
  value: unknown;
  format: Format;
  hint?: Label;
  gap?: GapId;
};

export type HeaderSpec = {
  title: string;
  subtitle?: string;
  initials: string;
  badges: BadgeSpec[];
};

export type ListItem = { label: string; value: string; hint?: string; badge?: BadgeSpec };

export type CardContent =
  | { kind: "fields"; fields: Field[] }
  | { kind: "list"; items: ListItem[] }
  | { kind: "placeholder"; gap: GapId; message: string };

export type CardSpec<D> = {
  key: string;
  title: Label;
  description?: Label;
  column: "main" | "side";
  gap?: GapId;
  content: (d: D) => CardContent;
};

export type TimelineEvent = {
  id: string;
  at: Date;
  title: string;
  description?: string;
  /** "Invoices", "Payments", "Tickets", "Interactions", "System", ... */
  module: string;
  status?: string;
  amount?: number;
};

export type TabContent<D> =
  | { kind: "table"; columns: ColumnSpec[]; rows: (d: D) => Row[]; empty: EmptyCopy; rowActions?: ActionSpec[] }
  | { kind: "timeline"; events: (d: D) => TimelineEvent[]; empty: EmptyCopy }
  | { kind: "placeholder"; gap: GapId; message: string };

export type TabSegment<D> = { key: string; label: Label; content: TabContent<D> };

export type TabSpec<D> = {
  key: string;
  label: Label;
  gap?: GapId;
  /** More than one segment renders a SegmentedControl inside the tab. */
  segments: TabSegment<D>[];
};

export type AlertSpec = {
  tone: BadgeTone;
  title: string;
  description: string;
  actions: ActionSpec[];
};

export type DetailSpec<R extends Row, D> = {
  key: string;
  load: (row: R, persona: Persona) => D;
  header: (d: D, persona: Persona) => HeaderSpec;
  /** Visible header buttons. */
  actions: ActionSpec[];
  /** The Actions ▾ dropdown per persona; `null` is a separator. */
  menu: (persona: Persona) => (ActionSpec | null)[];
  alert?: (d: D, persona: Persona) => AlertSpec | null;
  summary: (d: D, persona: Persona) => Field[];
  cards: CardSpec<D>[];
  tabs: TabSpec<D>[];
  gaps?: GapId[];
};
```

- [ ] **Step 2: Hook it into `ListSpec`.** Add after `gaps?: GapId[];` in `ListSpec`:

```ts
  /** When set, the first `link` column opens the row's profile. */
  // biome-ignore lint/suspicious/noExplicitAny: profiles are heterogeneous in their payload type
  detail?: DetailSpec<R, any>;
```

- [ ] **Step 3: Extend `Terms`** with `billingTab: string;` and `addressCell: string;`. Values per persona in `personas.ts`: utilities `"Bills & Usage"` / `"Service address"`, financial `"Statements"` / `"Service address"`, government_federal `"Statements"` / `"Address"`.

- [ ] **Step 4: Add two gap ids** to the `GapId` union and `gaps` record in `gaps.ts`:

```ts
  "ai-insights": {
    concept:
      "JAREIS guidance card (recommended actions with confidence, Execute / Useful / False positive / Dismiss) and \"Why they're calling\" chips",
    reason: "no AI card, confidence meter or feedback pattern",
    rendering: "badge",
  },
  mailbox: {
    concept:
      "Communications tab: message list with channel and status pills beside a details / compose pane",
    reason: "chat and composer parts exist, no split-pane mailbox composition",
    rendering: "badge",
  },
```

- [ ] **Step 5: Verify.** `pnpm lint:fix && pnpm --filter playground typecheck && pnpm --filter playground lint`. Expected: clean (the new types are unused so far; `Terms` additions compile because all three persona maps were updated).

- [ ] **Step 6: Commit.** `git commit -am "feat(playground): detail contract types, profile gap ids and persona terms"`

---

### Task 2: Profile shape and the per-party generator

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/shapes/party-detail.ts`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/network/detail.ts`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/mock/network.ts` (export `ACCOUNT_PREFIX`)
- Scratch (not committed): `<scratchpad>/profile-probe.mts`

**Interfaces:**
- Consumes: `NetworkContact`, `NetworkOrganization` (`mock/network.ts`); `createRng`, `seedFor`, `ANCHOR` (`mock/random.ts`); `weights`, `tenantOf`, `money`, `plusDays`, `round2` (`mock/common.ts`); `personName`, `emailFor`, `phone`, `address`, `organizationsByIndustry` (`mock/names.ts`); `arShape`, `arIssueWindow`, `payShape` (`mock/shapes/finance.ts`); `ticketsShape`, `ticketsCreatedWindow`, `callsShape` (`mock/shapes/support.ts`); `accountsShape` (`mock/shapes/network.ts`); `TimelineEvent`, `Persona`, `Row` (`specs/types.ts`).
- Produces: `partyDetail(row, persona): PartyDetail` and the types below, consumed by Task 5.

- [ ] **Step 1: Write `mock/shapes/party-detail.ts`.** Export `partyDetailShape: TableShape` (`table: "contacts+organizations+accounts+party_addresses"`, `totals` copied from `contactsShape.totals`, `source` all `{ tenant: "any", borrowed: true }`) whose `enums` and `numbers` carry the spec §6.2 facts, each with its source comment:

```ts
enums: {
  address_type: [["service", 25_460], ["mailing", 22_238], ["billing", 6_135]],
  account_type: [["customer", 53_692], ["unclassified", 22_083], ["vendor", 1_663], ["employee", 259]],
  contacts_per_org: [["1", 6061], ["2", 1078], ["3", 168], ["4", 26], ["5", 9], ["31", 60], ["32", 20]],
  source: [["Beacon", 35], ["SAP", 60], ["Oracle", 5]],           // from the ERP id keys in contacts.custom_fields
  supplier_tier: [["Preferred", 3], ["Approved", 5], ["Conditional", 2]],         // synthetic: 0 rows in QA
  supplier_status: [["Active", 7], ["Under review", 2], ["Suspended", 1]],       // synthetic: 0 rows in QA
  duplicate_signal: [["email", 5], ["phone", 3], ["name + address", 2]],
  language: [["English", 90], ["Spanish", 8], ["French", 2]],
  instrument_type: [["card", 6], ["ach", 3], ["wire", 1]],
},
numbers: {
  average_monthly_bill: { min: 35, median: 180, max: 2_400 },
  spend_ytd: { min: 1_200, median: 48_000, max: 1_250_000 },
  confidence: { min: 72, median: 86, max: 96 },
},
dates: { fromDaysAgo: 1, toDaysAgo: 60 },   // last_synced_at window (synthetic)
```

Also export the presence rates as named constants with a comment each: `TITLE_RATE = 0.13`, `DEPARTMENT_RATE = 0.41`, `MOBILE_RATE = 0.09`, `CONTACT_HAS_ORG_RATE = 0.19`, `CONTACT_HAS_ACCOUNT_RATE = 0.8`, `ORG_HAS_WEBSITE_RATE = 0.89`, `MAILING_RATE = 0.85`, `BILLING_RATE = 0.25`, `TWO_ACCOUNTS_RATE = 0.01`, `DUPLICATE_RATE = 0.12`, `VERIFIED_RATE = 0.5`, and `RELATED_COUNTS = { invoices: [0, 8], payments: [0, 6], tickets: [0, 4], interactions: [0, 10] } as const`.

- [ ] **Step 2: Write `mock/network/detail.ts`.** Export these types (all `Row`-based so tab tables can take them):

```ts
export type Verif = "verified" | "unverified" | "unset";
export type ProfileAddress = { type: "service" | "mailing" | "billing"; line: string; primary: boolean };
export type ProfileMethod = { type: "email" | "phone" | "mobile" | "whatsapp"; value: string; primary: boolean; verified: boolean };
export type ProfileInvoice = Row & { number: string; status: string; issueDate: Date; dueDate: Date; total: number; balance: number };
export type ProfilePayment = Row & { date: Date; document: string; amount: number; method: string; status: string; reference: string };
export type ProfileTicket = Row & { number: string; subject: string; status: string; priority: string; assignedTo: string | null; createdAt: Date };
export type ProfileInteraction = Row & { type: string; direction: string; status: string; fromTo: string; agent: string; startedAt: Date; durationMinutes: number | null };
export type ProfileAccount = Row & { number: string; type: string; status: string; balance: number; pastDue: number };
export type ProfileContact = Row & { name: string; title: string | null; email: string; phone: string; createdAt: Date };
export type ProfileOrganization = Row & { name: string; industry: string; networkStatus: string; facet: string };

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
  preferences: { email: Verif; sms: Verif; whatsapp: Verif; ebill: boolean; language: string };
  account: {
    numbers: string[];
    status: string;
    balance: number;
    pastDue: number;
    dueDate: Date | null;
    lastPayment: { amount: number; at: Date } | null;
    averageMonthlyBill: number;
    programs:
      | { kind: "utility"; budgetBilling: boolean; paymentArrangement: boolean; disconnectProtection: boolean }
      | { kind: "government"; filingStatus: string; paymentPlan: string; compliance: string };
    types: string[];
  };
  supplier?: {
    number: string; tier: string; status: string; description: string;
    spend: { ytd: number; variancePct: number; openPoAmount: number; openPoCount: number; pendingInvoices: number };
  };
  paymentInstruments: { label: string; type: string; isDefault: boolean }[];
  payout: { status: string; recipientId: string } | null;
  social: { platform: string; candidates: number; confidence: number }[];
  fingerprints: { sessions: number; pageViews: number; devices: number };
  duplicates: { name: string; email: string; signals: string; confidence: number }[];
  invoices: ProfileInvoice[];
  payments: ProfilePayment[];
  tickets: ProfileTicket[];
  interactions: ProfileInteraction[];
  organizations: ProfileOrganization[];
  contacts: ProfileContact[];
  accounts: ProfileAccount[];
  timeline: TimelineEvent[];
};

export const partyDetail = (
  row: NetworkContact | NetworkOrganization,
  persona: Persona,
): PartyDetail => { /* ... */ };
```

Rules for the body (spec §6):
- `const rng = createRng(seedFor(persona, `detail:${row.id}`))`; `kind` is `"organization"` when `"networkStatus" in row`.
- Reuse the row's own `name`, `email`, `phone`, `accountNumber`, `premiseAddress`, `balance`, `pastDueDate`, `createdAt`, `facet`: the service address is `row.premiseAddress`; the first account number is `row.accountNumber`; `account.balance` is `row.balance`; `account.pastDue` is `row.pastDueDate ? money(rng, accountsShape, `pastDue_${persona.key}`) clamped to ≤ balance : 0` (utilities has no `pastDue_` range: use 0); `account.dueDate` is `row.pastDueDate ?? (balance > 0 ? rng.daysAhead(3, 28) : null)`; `account.status` is `pastDue > 0 ? "Past due" : balance > 0 ? "Active" : "Current"`.
- `source` from `partyDetailShape.enums.source`; `customFields` always has the ERP id key when `source !== "Beacon"` (`sap_s4hanaId` / `oracle_ccnbId`, value `String(rng.int(10_000_000, 99_999_999))`), `description` with probability 0.34, plus one persona extra: utilities `preferredLanguage`, financial `quickbooksId`, government `qaGovPayerKey`.
- `isTenant`: organizations only, `rng.bool(0.05)`. `lastSyncedAt`: `rng.daysAgo(1, 60)` when `source !== "Beacon"`, else `row.createdAt`.
- Contacts: `title` with `TITLE_RATE` from a 12-entry title list in this file, `department` with `DEPARTMENT_RATE` from an 8-entry list. Organizations: `website` with `ORG_HAS_WEBSITE_RATE` as `https://${slug(name)}.example.com`.
- `addresses`: service always (primary), mailing with `MAILING_RATE` (`address(rng)`), billing with `BILLING_RATE`.
- `methods`: email and phone always (email primary), mobile with `MOBILE_RATE`, whatsapp with 0.1; `verified` with `VERIFIED_RATE`.
- `preferences`: each channel `"verified"` / `"unverified"` when the matching method exists, else `"unset"`; `ebill: rng.bool(0.4)`; `language` from the shape.
- `account.numbers`: `[row.accountNumber]` plus a second `\`${prefix}-${rng.int(10_000, 99_999)}\`` (prefix from `ACCOUNT_PREFIX`, which `mock/network.ts` must export) with `TWO_ACCOUNTS_RATE`; contacts without an account (`!rng.bool(CONTACT_HAS_ACCOUNT_RATE)`) get `numbers: []` and zero figures. `lastPayment` with 0.7 when balance > 0 or paid invoices exist. `averageMonthlyBill` from the shape. `programs` is `kind: "government"` for `government_federal` (filingStatus from `["Current", "Late", "Exempt"]`, paymentPlan `["None", "Installments"]`, compliance `["Compliant", "Under review"]`), else `kind: "utility"` with three `rng.bool(0.3)`. `types`: `[facet-as-account-type]` plus `"household"` (contacts) or `"internal"` (organizations) with 0.1.
- `supplier` only when `kind === "organization" && row.facet === "vendor"`.
- `paymentInstruments`: 0–3 entries, labels like `Visa ···· 4242` (card), `Checking ···· 1234` (ach); first is default. `payout`: with 0.25, `{ status: "Enrolled", recipientId: \`RCP-${rng.int(100_000, 999_999)}\` }`.
- `social`: 0–3 platforms from `["linkedin", "x", "facebook", "instagram"]`; `fingerprints`: sessions 0–40, pageViews 0–400, devices 0–3.
- `duplicates`: with `DUPLICATE_RATE`, 1–2 candidates (`personName` or an org name, `emailFor`, signal from shape, confidence from shape).
- Related records: counts `rng.int(min, max)` from `RELATED_COUNTS`; invoices use `arShape` statuses and totals for `tenantOf(arShape, persona.key)` and dates from `arIssueWindow[tenant]`, `number: \`INV-${rng.int(100_000, 999_999)}\``, `balance` by status (`balanceFor` from `mock/common.ts`); payments use `payShape` status/method for the tenant and amounts from `payShape.numbers.amount` scaled to ≤ the invoice total when a paid invoice exists (`document` is that invoice's number, else a bill `\`BILL-${rng.int(100_000, 999_999)}\``); tickets use `ticketsShape` status/priority for `tenantOf(ticketsShape, persona.key)` and `ticketsCreatedWindow`, subjects from an 8-entry list, `assignedTo` from `agentNames` with 0.7; interactions use `callsShape` enums (type, direction, status as named in the shape), `fromTo` `"${phone} → Support"` or reversed by direction, `durationMinutes` null when missed.
- Relationships: contact → `organizations` has one `ProfileOrganization` (industry from `organizationsShape.enums[`industry_${persona.key}`]`, `networkStatus` from `networkStatus_${persona.key}`) when `row.facet !== "employee" && rng.bool(CONTACT_HAS_ORG_RATE)`, else `[]`; organization → `contacts` count from `contacts_per_org`; both → `accounts` one `ProfileAccount` per `account.numbers` entry.
- `timeline` (spec §6.3): invoices → "Invoice INV-… issued" at `issueDate` (`module: "Invoices"`, `status`, `amount: total`) and "… paid" at `dueDate` when `status === "paid"`; payments → "Payment … received" (`module: "Payments"`); tickets → "Ticket … opened" (`module: "Tickets"`, `status`, `priority` in description) and "… resolved" at `createdAt + 1–20 days` when resolved/closed/confirmed; interactions → "`type` `direction`" (`module: "Interactions"`); plus "Record created" at `row.createdAt` and "Synced from `source`" at `lastSyncedAt` when `source !== "Beacon"` (`module: "System"`). Sort by `at` descending. Ids `${kind}-${i}`.

- [ ] **Step 3: Probe determinism and bounds.** Write `<scratchpad>/profile-probe.mts`:

```ts
import { networkData } from "<abs path>/mock/network.js";
import { partyDetail } from "<abs path>/mock/network/detail.js";
import { personas } from "<abs path>/personas.js";
const out: Record<string, unknown> = {};
for (const key of ["utilities", "financial", "government_federal"] as const) {
  const p = personas[key];
  const { contacts, organizations } = networkData(p);
  const a = partyDetail(contacts[0], p), b = partyDetail(contacts[0], p);
  const same = JSON.stringify(a) === JSON.stringify(b);
  const dupes = contacts.filter((c) => partyDetail(c, p).duplicates.length > 0).length;
  const zero = contacts.filter((c) => { const d = partyDetail(c, p); return d.invoices.length + d.payments.length + d.tickets.length + d.interactions.length === 0; }).length;
  const org = partyDetail(organizations.find((o) => o.facet === "vendor") ?? organizations[0], p);
  out[key] = { same, dupes, zero, invoices: a.invoices.length, timeline: a.timeline.length, supplier: !!org.supplier, orgContacts: org.contacts.length, statuses: [...new Set(a.invoices.map((i) => i.status))] };
}
console.log(JSON.stringify(out, null, 1));
```

Run: `cd apps/playground && npx tsx <scratchpad>/profile-probe.mts`. Expected: `same: true` for all three; `dupes` between 2 and 10 of 48; `zero` ≥ 0 and small; `timeline` ≥ 1; `supplier: true` when a vendor organization exists; no thrown error.

- [ ] **Step 4: Verify.** `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: clean.

- [ ] **Step 5: Commit.** `git add apps/playground/src/recipes/enterprise-ui-ux/mock && git commit -m "feat(playground): per-party profile generator shaped on the QA dump"`

---

### Task 3: Tab renderers (`detail-tabs.tsx`)

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/detail-tabs.tsx`

**Interfaces:**
- Consumes: `TabSpec`, `TabContent`, `TimelineEvent`, `Persona`, `Row`, `resolveLabel` (Task 1); `Cell`, `GapBadge`, `StatusBadge`, `Money` (`views/cells.tsx`); `GapPlaceholder`; `readValue`, `sortRows`, `PAGE_SIZE`, `pageWindow`, `SortState` (`views/list-state.ts`); `sameDay` (`specs/common.ts`).
- Produces: `export function DetailTabs<D>({ tabs, d, persona }: { tabs: TabSpec<D>[]; d: D; persona: Persona })`.

- [ ] **Step 1: Write `DetailTabs`.** `Tabs` from `@tilli.dev/ui-atoms/tabs` with `value`/`onValueChange` in state (default `tabs[0].key`); `TabsList variant="underline"`; one `TabsTab value={tab.key}` per tab showing `t(tab.label)` and `<GapBadge id={tab.gap} />` when set; one `TabsPanel value={tab.key}` rendering `<TabBody tab={tab} d={d} persona={persona} />`.

- [ ] **Step 2: Write `TabBody`.** State `segmentKey` (default first segment). When `tab.segments.length > 1`, render `SegmentedControl` (same props as the list view: `options`, `value`, `onChange`) above the content. Dispatch on `content.kind`:
  - `table` → `<TabTable />`: state `sort: SortState`, `page`. Rows `content.rows(d)` sorted via `sortRows`, paged by `PAGE_SIZE`; header cells clickable for `sortable` columns (same `ArrowUpDown` button as list view); body via `Cell` with `readValue`; a trailing actions column with the ghost `Ellipsis` `Menu` when `rowActions?.length`; `Empty` with `t(empty.title)` / `t(empty.description)` when no rows; `Pagination` (same markup as the list view) only when `pageCount > 1`; a muted line "Showing N of M".
  - `timeline` → `<TabTimeline />`: state `module: string` (default `"all"`). `const all = content.events(d)`; `const modules = [...new Set(all.map((e) => e.module))].sort()`; filtered by module; `Select` of `All modules` plus each module, with `<GapBadge id="filter-builder" />` beside it; line "Showing N of M events"; `Empty` when none; else `<Timeline value={items.length}>` with one `TimelineItem step={i + 1}` per event: `TimelineHeader` holds `TimelineIndicator`, `TimelineTitle` (title), `TimelineDate` (`Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })`); `TimelineContent` holds the description, a `Badge variant="secondary"` with the module, `StatusBadge` when `status`, `Money` when `amount !== undefined`; `TimelineSeparator` on all but the last. Insert a day heading (`text-muted-foreground text-xs uppercase`) before an item whose `at` is not `sameDay` with the previous one.
  - `placeholder` → `<GapPlaceholder id={content.gap} message={content.message} />`.

- [ ] **Step 3: Verify.** `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: clean (the component is unused until Task 4; `noUnusedImports` must be clean inside the file).

- [ ] **Step 4: Commit.** `git add apps/playground/src/recipes/enterprise-ui-ux/views/detail-tabs.tsx && git commit -m "feat(playground): profile tab renderers (table, timeline, placeholder)"`

---

### Task 4: The detail view shell (`detail-view.tsx`)

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/detail-view.tsx`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/row-panel.tsx` (moved out of `list-view.tsx`)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/views/list-view.tsx` (import `RowPanel`)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/views/cells.tsx` (tone maps; `past_due` in the error set)

**Interfaces:**
- Consumes: Task 1 types; `DetailTabs` (Task 3); `Cell`, `GapBadge` (`cells.tsx`); `GapPlaceholder`; `ActionSpec.panel` Sheet behaviour (copy `RowPanel` from `list-view.tsx` into `views/row-panel.tsx` and import it from both views; do not duplicate it).
- Produces:

```ts
export type DetailViewProps<R extends Row, D> = {
  spec: DetailSpec<R, D>;
  row: R;
  persona: Persona;
  moduleTitle: string;
  itemLabel: string;
  Icon: LucideIcon;
  backHash: string;
  onNavigate: (hash: string) => void;
};
export function DetailView<R extends Row, D>(props: DetailViewProps<R, D>): JSX.Element;
```

- [ ] **Step 1: Extract `RowPanel`.** Move the `RowPanel` function and its imports from `list-view.tsx` to `views/row-panel.tsx` (`export function RowPanel`), import it in `list-view.tsx`. Behaviour unchanged.

- [ ] **Step 2: Add tone maps to `cells.tsx`:**

```ts
export const badgeVariantOf: Record<BadgeTone, "secondary" | "success" | "warning" | "error" | "info"> =
  { neutral: "secondary", success: "success", warning: "warning", danger: "error", info: "info" };
export const alertVariantOf: Record<BadgeTone, "default" | "success" | "warning" | "error" | "info"> =
  { neutral: "default", success: "success", warning: "warning", danger: "error", info: "info" };
```

- [ ] **Step 3: Write `DetailView`.** Outer `DetailView` renders `DetailViewInner` with `key={`${spec.key}:${row.id}:${persona.key}`}`. Inner: `const d = useMemo(() => spec.load(row, persona), [spec, row, persona])`; `const header = spec.header(d, persona)`; `const alert = spec.alert?.(d, persona) ?? null`; `const fields = spec.summary(d, persona)`; `panel` state for Sheet actions as in the list view. Layout (spec §5.3), `flex flex-col gap-4`:
  1. `Breadcrumb` → `BreadcrumbList` with exactly three crumbs: `moduleTitle` as `BreadcrumbLink` to the module hash (`backHash.split("/").slice(0, 2).join("/")`), `itemLabel` as `BreadcrumbLink href={backHash}`, and `BreadcrumbPage` with `header.title`. Every `BreadcrumbLink` gets `onClick={(e) => { e.preventDefault(); onNavigate(href); }}` so navigation goes through the recipe's hash update, not a native fragment jump.
  2. Header row `flex flex-wrap items-start justify-between gap-3`: left `flex items-center gap-3` with `Avatar className="size-12"` → `AvatarFallback` `{header.initials}`, then a column: `h1 className="flex flex-wrap items-center gap-2 font-semibold text-2xl"` with the title and `Badge variant={badgeVariantOf[b.tone ?? "neutral"]}` per badge; `p className="text-muted-foreground text-sm"` with the subtitle. Right `flex flex-wrap items-center gap-2`: `spec.actions` as `Button size="sm" variant={action.variant ?? "outline"}` with icon, label and gap badge (same markup as list page actions); then `Menu` → `MenuTrigger render={<Button size="sm" />}` "Actions" with `ChevronDown`; `MenuPopup align="end"` over `spec.menu(persona)`, a `MenuSeparator` for each `null` and a `MenuItem` per action (icon, label, gap badge; `onClick` opens the Sheet when `action.panel`).
  3. `alert` → `Alert variant={alertVariantOf[alert.tone]}` with `AlertTitle`, `AlertDescription`, `AlertAction` holding one `Button size="sm" variant="outline"` per action (gap badge inline).
  4. Summary `Card` → `CardContent` with `dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6"`; each field a `div` with `dt className="text-muted-foreground text-xs uppercase"` (`t(label)` plus gap badge) and `dd className="text-sm"` (`<Cell currency={persona.currency} format={field.format} value={field.value} />`, then `hint` muted).
  5. Body `div className="grid gap-4 lg:grid-cols-12"`: `div className="flex flex-col gap-4 lg:col-span-7"` for `cards.filter(c => c.column === "main")` and `lg:col-span-5` for side. Each card: `Card` → `CardHeader` (`CardTitle` `t(title)` with gap badge; `CardDescription` when set) → `CardContent` rendering `content(d)`: `fields` as `dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"` (same dt/dd as the strip); `list` as `ul className="divide-y"` of `li className="flex items-center justify-between gap-3 py-2"` with label (medium) + hint (muted, below) on the left and value + `Badge` on the right; `placeholder` as `GapPlaceholder`. A `fields` card whose `fields` is empty renders nothing (specs use this to drop the organization-only cards); a `list` card with no items renders one muted "None" row.
  6. `Card` → `CardContent className="pt-4"` → `<DetailTabs tabs={spec.tabs} d={d} persona={persona} />`.
  7. `RowPanel` for Sheet actions.
  Page-level `spec.gaps` render as a badge row under the header, like lists.

- [ ] **Step 4: Verify.** `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build`. Expected: clean; `RowPanel` extraction leaves the list view behaviour intact (open `#/finance/receivables`, Partner settlements segment, a row's settlement action still opens the Sheet).

- [ ] **Step 5: Commit.** `git add -A apps/playground/src/recipes/enterprise-ui-ux/views && git commit -m "feat(playground): generic profile view with header, summary strip, cards and tabs"`

---

### Task 5: Contact and organization profile specs

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/specs/network/detail.tsx`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/specs/network/labels.ts` (`networkStatusLabel`, moved out of `network.tsx`)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/specs/network.tsx` (import the label; add `detail:` to `contacts` and `organizations`)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/specs/common.ts` (add `initialsOf`, `humanise`)

**Interfaces:**
- Consumes: `partyDetail`, `PartyDetail` and the `Profile*` row types (Task 2); Task 1 types; `capitalise`, `empty` (`specs/common.ts`).
- Produces: `export const partyDetailSpec: (kind: "contact" | "organization") => DetailSpec<NetworkContact | NetworkOrganization, PartyDetail>`.

- [ ] **Step 1: Helpers in `specs/common.ts`:**

```ts
/** "Ada Lovelace" → "AL"; a single word gives its first two letters. */
export const initialsOf = (name: string): string
/** "sap_s4hanaId" → "SAP S/4HANA id"; "follow_up_status" → "Follow up status"; camelCase splits on capitals. */
export const humanise = (key: string): string
```
`humanise` has an explicit map for `sap_s4hanaId`, `oracle_ccnbId`, `quickbooksId`, `qaGovPayerKey` → "SAP S/4HANA id", "Oracle CC&B id", "QuickBooks id", "Payer key"; everything else: split on `_` and camel boundaries, lowercase, capitalise the first letter. Regexes hoisted to module constants.

- [ ] **Step 2: Write `partyDetailSpec(kind)`** following spec §5.4 exactly:
  - `key: `${kind}-profile``; `load: (row, persona) => partyDetail(row, persona)`.
  - `header`: title `d.row.name`; initials `initialsOf(d.row.name)`; subtitle `[email, phone, kind === "organization" ? industry : null].filter(Boolean).join(" · ")`; badges: `{ label: d.source, tone: "info" }`, `{ label: facetLabel }` where facetLabel is the persona term for the row's facet (`personCustomer` / `personVendor` / `personEmployee`, `orgCustomer` / `orgVendor` / `orgEmployee`), and for organizations `{ label: networkStatusLabel[row.networkStatus], tone: connected → "success", invited → "warning", not_invited → "neutral" }` plus `{ label: "Beacon tenant", tone: "info" }` when `d.isTenant`. Import `networkStatusLabel` from `specs/network.tsx` by moving it to `specs/network/labels.ts` (export it from there; `network.tsx` imports it) to avoid a cycle.
  - `actions`: `[{ label: "Edit", icon: Pencil, variant: "outline" }, { label: "Link", icon: Link2, variant: "outline" }, { label: "Refresh", icon: RotateCw, variant: "outline" }]`.
  - `menu: (persona) =>` the list below (null = separator), minus Start/Stop/Transfer and Create service order when `persona.key === "government_federal"` (today's rule): Send payment link (`Send`), organizations only: Take payment (`CreditCard`), Send refund link (`Undo2`), Send OTP (`KeyRound`), Set payment arrangement (`CalendarClock`), Enroll AutoPay (`Repeat`), Enroll eBill (`Mail`), Enroll in PayOut (`Banknote`), Generate enrollment link (`Link2`), `null`, Start/Stop/Transfer (`ArrowLeftRight`, `gap: "flow-builder"`), Schedule appointment (`CalendarPlus`, `gap: "drag-calendar"`), Create service order (`Wrench`), `null`, Send bill copy (`FileText`, `gap: "pdf-preview"`), Waive fee (`BadgePercent`), `null`, Send application (`ClipboardList`).
  - `alert`: `d.duplicates.length ? { tone: "warning", title: `This ${entity} might be the same as ${n} other record${n === 1 ? "" : "s"}`, description: `Matched on ${signals} · ${confidence}% confidence · ${candidates}`, actions: [{ label: "Merge", icon: GitMerge, gap: "merge-review" }, { label: "They're different", icon: X, variant: "ghost" }] } : null` where `entity` is `persona.terms.contact` / `.organization` lowercased, `signals` joins the distinct candidate signals, `confidence` is the max, `candidates` joins `name · email`.
  - `summary`: six fields per spec §5.4 (labels: `"Accounts"`, `(t) => t.addressCell`, `"Mailing address"`, `"Account status"`, `"Delinquency"`, and `"Verification"` or, for `government_federal`, `"Risk flags"` with value `"None"`, format `text`). Delinquency is `{ label: "Delinquency", format: "status", value: pastDue > 0 ? "Past due" : "Current", hint: pastDue > 0 ? `$${pastDue.toFixed(2)}` : undefined }`; add `past_due` to the `error` word set in `cells.tsx` so the badge turns red.
  - `cards` (static list; the view's empty-`fields` rule hides the organization-only ones): Account snapshot (main), Additional details (main), Supplier (main; `fields: []` unless `d.supplier`), Spend (main, `gap: "charts"`; same rule). Side: Contact methods, Addresses, Preferences, Payment instruments, Signals; each `list` content per spec §5.4.
  - `tabs`: Activity (`timeline` over `d.timeline`, empty "No activity yet" / "Invoices, payments, tickets and calls will appear here."); Billing with segments `(t) => t.billingTab` (table of `d.invoices`: Number `link`, Status `status`, Issue date `date`, Due `date`, Total `money` end, Balance `money` end; rowActions `[{ label: "Preview", icon: FileText, gap: "pdf-preview" }]`) and `(t) => t.payments` (Date `date`, Document `text`, Amount `money` end, Method `badge` via `capitalise`, Status `status`, Reference `text`); Support with segments `(t) => t.tickets` (#, Subject `link`, Status `status`, Priority `badge`, Assigned `text`, Opened `date`) and `Interactions` (Type `badge`, Direction `badge`, Status `status`, From → To `text`, Agent `text`, Started `datetime`, Duration `duration`); Relationships with segments: contact → `(t) => t.organization` (Name `link`, Industry, Network status `status`, Facet `badge`) and `Accounts` (Account # `link`, Type `badge`, Status `status`, Balance `money`, Past due `money`); organization → `(t) => t.contacts` (Name `link`, Title, Email, Phone, Created `date`) and `Accounts`; Communications (`gap: "mailbox"`, one segment whose content is `{ kind: "placeholder", gap: "mailbox", message: "Message history and the composer need a mailbox composition." }`); Notes (`gap: "rich-text"`, one segment with `{ kind: "placeholder", gap: "rich-text", message: "Notes and cases need a rich-text editor." }`). Every table segment has `empty` copy.
  - `gaps: ["ai-insights", "map"]`.

- [ ] **Step 3: Wire into `networkSpecs`:** `contacts: { …, detail: partyDetailSpec("contact") }` and `organizations: { …, detail: partyDetailSpec("organization") }`.

- [ ] **Step 4: Verify.** `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build`. Expected: clean. Nothing renders yet (Task 6 wires the route).

- [ ] **Step 5: Commit.** `git add -A apps/playground/src/recipes/enterprise-ui-ux/specs && git commit -m "feat(playground): contact and organization profile specs on the detail contract"`

---

### Task 6: Routing, list link navigation and the detail branch

**Files:**
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/routing.ts`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/views/list-view.tsx`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/index.tsx`

**Interfaces:**
- Produces: `Route = { module: ModuleKey; item?: SectionItem; id?: string }`; `hashFor(module, item?, id?)`; `ListView` prop `onOpenRow?: (row: R) => void`.

- [ ] **Step 1: `routing.ts`.** `routeFromHash`: destructure `[moduleKey = "", slug, id]`; when the item resolves, return `id ? { module, item, id } : { module, item }`. `hashFor = (module, item?, id?) => item ? (id ? `#/${module}/${itemSlug(item)}/${id}` : `#/${module}/${itemSlug(item)}`) : `#/${module}``. Update the doc comment: a third segment is a record id, meaningful only when the item's list spec has a `detail` (resolved in `index.tsx` to avoid a specs ↔ routing import cycle).

- [ ] **Step 2: `list-view.tsx`.** Add `onOpenRow?: (row: R) => void` to `ListViewProps`. Compute `const linkKey = onOpenRow ? columns.find((c) => c.format === "link")?.key : undefined;`. In the body cell loop, when `column.key === linkKey` render `<Button className="h-auto p-0" onClick={() => onOpenRow?.(row)} size="sm" variant="link">{String(readValue(column, row))}</Button>` instead of `Cell`.

- [ ] **Step 3: `index.tsx`.** After `itemSpec`: 

```ts
const detailRow =
  route.id && itemSpec?.detail
    ? itemSpec.rows(personas[persona]).find((row) => row.id === route.id)
    : undefined;
```
In `mainView`, before the list branch: when `route.item && itemSpec?.detail && detailRow`, return `<DetailView Icon={route.item.icon} backHash={hashFor(active, route.item)} itemLabel={route.item.label} moduleTitle={title} onNavigate={go} persona={personas[persona]} row={detailRow} spec={itemSpec.detail} />`. The list branch gains `onOpenRow={itemSpec.detail ? (row) => go(hashFor(active, route.item, row.id)) : undefined}`.

- [ ] **Step 4: Verify in the browser** (dev server `pnpm --filter playground dev`, or the user's at `http://localhost:5173`):
  1. `#/network/contacts`: the Name cells are buttons; click the first → hash becomes `#/network/contacts/contact-1`, breadcrumb reads Network › Contacts › <name>, the h1 shows the name with badges, six summary cells, cards in two columns, tabs Activity / Bills & Usage… / Support / Relationships / Communications / Notes.
  2. Click every tab and both segments of Billing, Support and Relationships; no console errors.
  3. Breadcrumb "Contacts" → back to the list with the hash `#/network/contacts`; the panel still highlights Contacts while the profile is open.
  4. `#/network/organizations/organization-3`: the organization variant (network status badge, Relationships shows contacts). Find a vendor-facet organization and confirm the Supplier and Spend cards.
  5. Control panel (Cmd/Ctrl+K) → persona `government_federal` on an open profile: same id, labels Address / Risk flags / Statements / Service Requests, tab resets to Activity.
  6. `#/network/contacts/contact-999` → the contacts list, no error. `#/finance/receivables/anything` → the receivables list (no `detail`).
  7. Find a contact whose Billing and Support tables are all empty (walk `contact-1..contact-12`): each shows its Empty copy; Activity shows the system events only.
  8. `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build`: clean.

- [ ] **Step 5: Commit.** `git commit -am "feat(playground): route the Network name links to contact and organization profiles"`

---

### Task 7: Walkthrough pass, registry bump and docs

**Files:**
- Modify: `docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs`
- Modify: `apps/playground/recipes.json`
- Modify: `docs/superpowers/specs/2026-11-10-enterprise-mocks-design.md` (§8 table: two rows)
- Modify: `docs/superpowers/plans/2026-11-10-enterprise-mocks-run/README.md` (one paragraph: the `--details` pass)

- [ ] **Step 1: `check-recipe.mjs --details`.** When `flags.includes("--details")`, after the routes loop for a persona, run a details pass for each of `#/network/contacts` and `#/network/organizations`: goto the list, click `main tbody tr:first-child button` (the first link cell), wait for `main h1`, and record one JSON line `{ persona, route: "<list>/<id from location.hash>", h1, crumbs: text("nav li"), badges: `main h1 [data-slot='badge']` count, summaryCells: `main dl > div` count on the first `dl`, cards: `main [data-slot='card']` count, tabs: text of `main [role='tab']`, tabErrors: for each tab click it, wait 200 ms, note new console errors, overflowX at the current viewport }`. Then repeat the overflow read at viewport 1024×800 and with `localStorage["control:inset"] = {"type":"switch","value":true}` (reload) and record `overflowAt1024`, `overflowInset`. Count into `summary.pages`, `summary.consoleErrors`, `summary.pageErrors`, `summary.overflowX`. Reset the viewport and the inset key afterwards. Keep every regex a module constant or `new RegExp` (Biome runs on this file).

- [ ] **Step 2: Run it** against the dev server: `node docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs http://localhost:5173 utilities,financial,government_federal "$(paste -sd, docs/superpowers/plans/2026-11-10-enterprise-mocks-run/routes.txt)" --interact --details`. Expected SUMMARY: `consoleErrors: 0, pageErrors: 0, overflowX: 0, failures: []`, pages = 120 + 6; each details line has a non-empty `h1`, three crumbs, six summary cells, six tabs, `tabErrors` all empty, and `overflowAt1024 === false`, `overflowInset === false`.

- [ ] **Step 3: Registry.** In `recipes.json`, the `enterprise-ui-ux` entry: `components` adds `alert`, `breadcrumb`, `tabs`, `timeline` (sorted); `version: "1.3.0"`; append `{ "version": "1.3.0", "date": "<today>", "changes": "Add contact and organization profiles reached from the Network lists: a shared detail contract and view with header, summary strip, cards, and Activity, Billing, Support and Relationships tabs, fed by a per-party generator shaped on the QA database; two new gap ids (ai-insights, mailbox)." }`. Run `pnpm lint:fix`, then `pnpm test` at the root. Expected: all tests pass, including the catalog test's `components` equality (if it fails, the diff it prints is the exact set to use).

- [ ] **Step 4: Docs.** Append the two gap rows (`ai-insights`, `mailbox`) to §8 of the 1.2.0 spec with the same columns as the existing rows. Add a paragraph to the run folder README describing the `--details` flag and the expected summary. Add a section "1.3.0 profiles" to the run ledger with the walkthrough summary line.

- [ ] **Step 5: Final verification.** `pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build && pnpm test`. All clean.

- [ ] **Step 6: Commit.** `git add -A apps/playground/recipes.json docs && git commit -m "feat(playground): enterprise recipe 1.3.0 with contact and organization profiles, walkthrough details pass"`
