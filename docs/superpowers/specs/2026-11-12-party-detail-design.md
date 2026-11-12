# Enterprise UI/UX recipe: contact and organization profiles (recipe 1.3.0)

**Date:** 2026-11-12. **Status:** design, awaiting owner review. **Repo:** `~/tilli/ui-atoms`, branch `feat/version-1.1.0`.
**Builds on:** `2026-11-10-enterprise-mocks-design.md` (the list and dashboard mocks, recipe 1.2.0) and its appendices.
Everything that spec fixes (personas, terms, gap badges, privacy, mock data rules) still applies; this spec only adds.

## 1. Goal

Give the `enterprise-ui-ux` recipe its first individual resource pages: a profile for one contact and a profile for one
organization, reached from the name link in Network › Contacts and Network › Organizations. The two share one
redesigned layout composed from `@tilli.dev/ui-atoms` parts only, carry today's information (identity, account
snapshot, contact methods, preferences, related records) in fewer and larger sections, switch persona like the lists,
and flag every concept ui-atoms cannot render with the existing `Needs review` badge.

The work also introduces the contract (`DetailSpec`) and the view (`DetailView`) that every later resource page
(an invoice, a ticket, an order) will reuse, so the second detail page is a spec file and nothing else.

Success means: on any persona, clicking a contact or organization name opens a stable, fully rendered profile with
four working tabs, the breadcrumb leads back to the list, the page never scrolls horizontally, the headless walkthrough
passes on both pages for all three personas, and `lint`, `typecheck`, `build` and the repo tests are green.

## 2. Inputs

- Today's pages in beacon-enterprise: `apps/web/src/pages/ContactDetail.tsx` and `pages/OrganizationDetail.tsx`
  (routes `contacts/:id`, `organizations/:id` in `App.tsx`), plus the shared sub-components they render
  (`components/timeline/UnifiedAccountTimeline.tsx`, `components/tickets/TicketList.tsx`,
  `components/shared/CustomFieldsCard.tsx`, `components/nudge/NudgeMailbox.tsx`, `components/billing/OrgBillingTab.tsx`).
  Traced on 2026-11-11; the structure they share is in §4.
- The read-only QA dump (`postgres://qa_ro:qa_ro@127.0.0.1:5499/beacon_qa`): `contacts`, `organizations`, `accounts`
  (`attributes` jsonb), `party_addresses`, `party_contact_points`, `contact_methods`, `organization_methods`,
  `attachments`, and the forty-odd tables with a `contact_id`, `organization_id` or `party_id` column. Aggregates
  profiled on 2026-11-11 are transcribed into §6.
- `apps/web/src/lib/industry-config.ts`: the terms that change on these pages (§7).
- The recipe as of commit `6d72103`: `routing.ts`, `specs/types.ts`, `views/list-view.tsx`, `views/cells.tsx`,
  `mock/network.ts`, `mock/shapes/network.ts`, `gaps.ts`.

## 3. Owner decisions (2026-11-11)

| # | Decision |
|---|---|
| P1 | Fidelity: a redesigned profile, not a mirror of today's three-column page. Today's information is kept and regrouped; flagged, AI and settings widgets become badges. |
| P2 | Tabs in this version: Activity (unified timeline), Billing (invoices and payments), Support (tickets and interactions), Relationships (new: the organization's contacts, the contact's organization and linked accounts). |
| P3 | Data: generated per party on demand from the row id (approach 1). Module lists are not cross-linked; a profile's invoices are not rows of Finance › Invoices. |
| P4 | Placement: inside `enterprise-ui-ux`, version 1.3.0, same branch, same subagent-driven execution as 1.2.0. |

## 4. What today's pages show (traced)

Two near-identical pages with no shared layout, eyebrow "Partner Profile". Header: name, source badge, owning-org chip,
subtitle `email · phone` (`· industry` for organizations), buttons Create new account / Link / Edit / Refresh and an
**Actions ▾** menu (Send payment link, Send refund link, Send OTP, Set payment arrangement, Enroll AutoPay, Enroll eBill,
Enroll in PayOut, Generate enrollment link; Start/Stop/Transfer, Schedule appointment, Create service order; Send bill
copy, Waive fee; Send application). A duplicate-match banner (Merge / They're different). A six-cell summary strip:
Accounts, Service address, Mailing address, Verification, Account status, Delinquency, Vulnerability flags. Then three
columns: left JAREIS guidance, Sources, Account snapshot, Additional details (custom fields); middle "Why they're
calling" chips and Outage & field activity; right a Manage preferences panel with five sub-tabs (Digital preferences,
Communication methods, Social profile, Digital fingerprints, Payment instruments). Below, an Account timeline card
with eight tabs (Unified timeline, Bills, Payments, Service orders, Tickets, Communications, Interactions, Notes & cases;
organizations add Billing config). Organizations behind a flag also get a Supplier card, lifecycle chevron, spend KPIs
and expiring POs. Neither page lists an organization's contacts or a contact's organization; neither has delete, call,
create invoice or add note.

## 5. Design

### 5.1 Routing and navigation

- The hash gains an optional third segment: `#/<module>/<item>/<id>`. `Route` becomes `{ module; item?; id? }`.
  `routeFromHash` keeps `id` only when the item's list spec has a `detail`; otherwise it drops the segment and the
  route is the item's list. `hashFor(module, item?, id?)` mirrors it.
- `ListSpec.detail?: DetailSpec<R, unknown>`. When set, the list's **first** column with `format: "link"` navigates to
  `hashFor(module, item, row.id)` on click. Other link columns (account number) and all row actions stay inert.
- An `id` that no row of `spec.rows(persona)` carries renders the list, not an error page (same fallback family as an
  unknown item). This is also what happens after a persona switch, since ids are derived from the persona seed.
- The detail header's breadcrumb (ui-atoms `breadcrumb`) is `Module › Item › Record name`; Item links back to the list.
  `ModulePanel` keeps the item highlighted while `route.id` is set (`isActive={route.item === item}` already does).
- Navigation keeps the recipe's replace-style hash update; no push history in this version.

### 5.2 The detail contract (`specs/types.ts`)

```ts
export type Tone = "neutral" | "success" | "warning" | "danger" | "info";
export type BadgeSpec = { label: Label; tone?: Tone };

/** One key/value on a profile; `format` reuses the table cell renderer. */
export type Field = { label: Label; value: unknown; format: Format; hint?: Label; gap?: GapId };

export type HeaderSpec = {
  title: string;
  subtitle?: string;
  initials: string;
  badges: BadgeSpec[];
};

export type CardContent =
  | { kind: "fields"; fields: Field[] }
  | { kind: "list"; items: { label: string; value: string; hint?: string; badge?: BadgeSpec }[] }
  | { kind: "placeholder"; message: string };

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
  module: string;           // "Invoices" | "Payments" | "Tickets" | "Interactions" | "System" | ...
  status?: string;
  amount?: number;
};

export type TabContent<D> =
  | { kind: "table"; columns: ColumnSpec[]; rows: (d: D) => Row[]; empty: EmptyCopy; rowActions?: ActionSpec[] }
  | { kind: "timeline"; events: (d: D) => TimelineEvent[]; empty: EmptyCopy }
  | { kind: "placeholder"; message: string };

export type TabSpec<D> = {
  key: string;
  label: Label;
  gap?: GapId;
  /** Several segments render as a SegmentedControl inside the tab, like list segments. */
  segments: { key: string; label: Label; content: TabContent<D> }[];
};

export type AlertSpec = {
  tone: Tone;
  title: string;
  description: string;
  actions: ActionSpec[];
};

export type DetailSpec<R extends Row, D> = {
  key: string;
  load: (row: R, persona: Persona) => D;
  header: (d: D, persona: Persona) => HeaderSpec;
  actions: ActionSpec[];        // visible header buttons
  menu: (ActionSpec | null)[]; // the Actions ▾ dropdown (ui-atoms menu); null is a separator
  alert?: (d: D, persona: Persona) => AlertSpec | null;
  summary: (d: D, persona: Persona) => Field[];
  cards: CardSpec<D>[];
  tabs: TabSpec<D>[];
  gaps?: GapId[];               // page-level badges, as on lists
};
```

Rules: `load` runs once per `(row.id, persona.key)` and is memoised in the view; `header`, `summary`, `alert` and every
card and tab read only `D`. `ActionSpec` is reused unchanged, so an action's `gap` renders the badge and `panel` opens
the same Sheet as on lists. Every label is a `Label` and resolves through `resolveLabel`. Cards and tabs with `gap` show
the badge next to their title. A `placeholder` card or tab renders the dashed gap placeholder used by dashboards.

### 5.3 The view (`views/detail-view.tsx`)

Props: `{ moduleKey, moduleTitle, item, row, persona, spec, backHash }`. Keyed by `${spec.key}:${row.id}:${persona.key}`
so state resets per profile. Layout, top to bottom, inside the existing `ContentView`:

1. **Header.** Breadcrumb; then a row with `Avatar` (initials fallback, `size-12`), the h1 and the badges (ui-atoms
   `badge`, tone mapped to the `statusTone` palette in `cells.tsx`), the subtitle under the name; on the right the
   `actions` as `size="sm"` buttons and an `Actions` button that opens a ui-atoms `menu` with the `menu` items, a
   `MenuSeparator` wherever the spec has `null`. Gap badges inline as on lists.
   The row wraps on narrow widths and the content column keeps `min-w-0`.
2. **Alert.** ui-atoms `alert` with tone, title, description and action buttons, when `alert(d)` returns one.
3. **Summary strip.** One `Card`; a grid `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` of `Field`s, label small/muted,
   value through `Cell`.
4. **Body.** `grid gap-4 lg:grid-cols-12`; main cards in `lg:col-span-7`, side cards in `lg:col-span-5`, each a `Card`
   with title, optional description and gap badge. `fields` content is a two-column definition grid; `list` content is
   stacked rows with a trailing badge; `placeholder` is the gap placeholder.
5. **Tabs card.** One `Card` holding ui-atoms `tabs`; the active tab lives in component state (default: first tab).
   A tab with more than one segment shows the `SegmentedControl` first. `table` content reuses `Cell`, the sort and
   paging helpers in `list-state.ts` (sortable columns, `PAGE_SIZE` 25, `Pagination` when needed), `rowActions` as the
   same ghost icon buttons the list uses, and `Empty` for zero rows. `timeline` content renders the ui-atoms `timeline`
   with one item per event (indicator, date, title, description, module badge, status badge, `Money` when `amount`),
   grouped under day headings, newest first, with a `Select` of modules ("All modules" plus each distinct `module`) and
   a count line "Showing N of M events". The filter select carries the `filter-builder` gap badge.

The file splits when it passes about 400 lines: `detail-view.tsx` (shell, header, summary, cards) and
`detail-tabs.tsx` (tabs, table and timeline renderers).

### 5.4 The profile specs (`specs/network/detail.tsx`)

One factory, `partyDetail(kind: "contact" | "organization")`, returns the `DetailSpec`; `networkSpecs.items.contacts`
and `.organizations` set `detail: partyDetail("contact" | "organization")`. The payload type `PartyDetail` is in §6.

**Header.** Title: the row's `name`. Initials: first letters of the first two words. Subtitle: `email · phone`
(`· industry` for organizations). Badges, in order: source (`Beacon`, `SAP`, `Oracle`; tone info), facet (persona term:
`personCustomer` / `orgCustomer` etc.; neutral), organizations only: network status (Connected success, Invited warning,
Not invited neutral) and `Beacon tenant` (info) when `d.isTenant`.

**Actions.** `[Edit (Pencil), Link (Link2), Refresh (RotateCw)]`, all outline. Refresh has a tooltip "Synced 2 h ago"
from `d.lastSyncedAt`. **Menu**, in today's order with separators: Send payment link, Send refund link, Send OTP, Set
payment arrangement, Enroll AutoPay, Enroll eBill, Enroll in PayOut, Generate
enrollment link; ─ Start/Stop/Transfer (`gap: "flow-builder"`), Schedule appointment (`gap: "drag-calendar"`), Create
service order; ─ Send bill copy (`gap: "pdf-preview"`), Waive fee; ─ Send application. Organizations add Take payment
after Send payment link. Government personas hide Start/Stop/Transfer and Create service order (today's rule).

**Alert.** When `d.duplicates.length > 0`: tone warning, title `This {contact|organization} might be the same as N other
records` (entity term from persona), description `Matched on {signals} · {confidence}% confidence` followed by the
candidates' `name · email`, actions `Merge` (`gap: "merge-review"`) and `They're different`.

**Summary strip** (six `Field`s): Accounts (`text`: account numbers joined, or "Not linked"); Service address
(`text`; government label "Address"); Mailing address (`text`, or "Same as service"); Account status (`status`);
Delinquency (`status`: `"$X past due"` danger when `pastDue > 0`, else `"Current"`); Verification (`status`:
Verified / Not verified from any verified contact method). Government personas replace the sixth cell with "Risk flags"
(`text`, value "None"), as today; the label is a literal since only one persona shows it.

**Cards, main column.** *Account snapshot* (`fields`): Current balance (money), Past due (money), Due date (date), Last
payment (`text`: "$amt · date"), Avg monthly bill (money), then for utilities and financial: Budget billing, Payment
arrangement, Disconnect protection (`status`: Enrolled / Not enrolled, None / Active, Protected / At risk); for
government: Filing status, Payment plan, Compliance (`status`). Then Account types (`badge`: the facet plus `household`
or `internal` when drawn). *Additional details* (`fields`, format `text`): the custom fields, keys humanised
(`sap_s4hanaId` → "SAP S/4HANA id", `follow_up_status` → "Follow up status"). Organizations only, when
`facet === "vendor"`: *Supplier* (`fields`: Supplier number, Tier, Supplier status (`status`), Website (`link`),
Description) and *Spend* (`fields`, `gap: "charts"`: YTD spend (money), Variance vs last year (`percent`), Open POs
(`text`: "$amt · N orders"), Pending invoices (`count`)).

**Cards, side column.** *Contact methods* (`list`: value, hint = type label, badge Primary / Verified / Unverified).
*Addresses* (`list`: one line per address, hint = Service / Mailing / Billing, badge Primary on the primary).
*Preferences* (`list`: Email, SMS, WhatsApp with badge Verified / Unverified / Not set; eBill with Enrolled / Not
enrolled; Language). *Payment instruments* (`list`: "Visa ···· 4242" style masked methods with hint = type, badge
Default; a last row "Payout enrollment" with the status badge and recipient id as hint). *Signals* (`list`: one row per
social platform with the candidate count and confidence hint; then Sessions, Page views, Devices with counts).

**Tabs.** Labels through `Terms`; see §7.
- *Activity*: one `timeline` segment over `d.timeline`.
- *Billing*: segments `{invoices term}` (table: Number (link), Status, Issue date, Due, Total, Balance) and `Payments`
  (table: Date, Document, Amount, Method, Status, Reference). Row action on invoices: Preview (`gap: "pdf-preview"`).
- *Support*: segments `{tickets term}` (table: #, Subject (link), Status, Priority (badge), Assigned, Opened) and
  `Interactions` (table: Type, Direction (badge), Status, From → To (text), Agent, Started (datetime), Duration).
- *Relationships*: contact: segments `Organization` (table: Name (link), Industry, Network status, Facet) and
  `Accounts` (table: Account # (link), Type, Status, Balance, Past due); organization: segments `{contacts term}`
  (table: Name (link), Title, Email, Phone, Created) and `Accounts` (same columns).
- *Communications* (`gap: "mailbox"`) and *Notes* (`gap: "rich-text"`): one `placeholder` segment each, messages
  "Message history and composer need a mailbox composition." and "Notes and cases need a rich-text editor." The tab
  stays clickable so the gap is visible, as the dashboards' placeholders are.

Link columns inside tabs are inert in this version (no second-level routes), rendered as links so the intent reads.

### 5.5 Registry

`recipes.json`: `components` adds `alert`, `breadcrumb`, `tabs`, `timeline` (the menu separator is `MenuSeparator`
from `menu`, already listed), version `1.3.0`, changelog item dated the day it ships:
"Contact and organization profiles reached from the Network lists, on a shared detail contract." `pnpm lint:fix`
restores the canonical format; the catalog test is the oracle.

## 6. Mock data

### 6.1 Generator

`mock/network/detail.ts` exports `partyDetail(row: NetworkContact | NetworkOrganization, persona: Persona): PartyDetail`
and `PartyDetail`. It seeds `createRng(seedFor(persona, `detail:${row.id}`))` so a profile is stable across reloads,
sorts and filters, and independent of list order. Nothing in `mock/network.ts` changes. Names, emails, companies and
addresses come from `mock/names.ts`; the row's own `name`, `email`, `phone`, `accountNumber`, `premiseAddress`,
`balance`, `pastDueDate`, `createdAt` and `facet` are reused as-is so the profile agrees with the list.

```ts
export type PartyDetail = {
  row: NetworkContact | NetworkOrganization;
  kind: "contact" | "organization";
  source: "Beacon" | "SAP" | "Oracle";
  isTenant: boolean;                    // organizations only; false for contacts
  lastSyncedAt: Date;
  title?: string; department?: string;  // contacts
  website?: string;                     // organizations
  customFields: Record<string, string>;
  addresses: { type: "service" | "mailing" | "billing"; line: string; primary: boolean }[];
  methods: { type: "email" | "phone" | "mobile" | "whatsapp"; value: string; primary: boolean; verified: boolean }[];
  preferences: { email: Verif; sms: Verif; whatsapp: Verif; ebill: boolean; language: string };  // Verif = "verified" | "unverified" | "unset"
  account: {
    numbers: string[]; status: string; balance: number; pastDue: number; dueDate: Date | null;
    lastPayment: { amount: number; at: Date } | null; averageMonthlyBill: number;
    programs: { budgetBilling: boolean; paymentArrangement: boolean; disconnectProtection: boolean }
            | { filingStatus: string; paymentPlan: string; compliance: string };
    types: string[];
  };
  supplier?: { number: string; tier: string; status: string; description: string;
               spend: { ytd: number; variancePct: number; openPoAmount: number; openPoCount: number; pendingInvoices: number } };
  paymentInstruments: { label: string; type: string; isDefault: boolean }[];
  payout: { status: string; recipientId: string } | null;
  social: { platform: string; candidates: number; confidence: number }[];
  fingerprints: { sessions: number; pageViews: number; devices: number };
  duplicates: { name: string; email: string; signals: string; confidence: number }[];
  invoices: Row[]; payments: Row[]; tickets: Row[]; interactions: Row[];
  organizations: Row[]; contacts: Row[]; accounts: Row[];
  timeline: TimelineEvent[];
};
```

### 6.2 Shape (`mock/shapes/party-detail.ts`)

Transcribed from the dump on 2026-11-11, live rows across all tenants; the file carries these comments.

| Fact | Value | Use |
|---|---|---|
| Contacts with `title` / `department` / `mobile` | 13% / 41% / 9% | presence of the fields |
| Contacts with a linked organization / account / owner | 19% / 80% / 35% | Relationships: contact gets an organization for commercial facet or 19% otherwise; one account for 80%, else "Not linked" |
| Contact `custom_fields` keys | `sap_s4hanaId` 60%, `description` 34%, `oracle_ccnbId` 5%, `quickbooksId`, `qaGovPayerKey`, `preferredLanguage` | Additional details; the ERP key present decides `source` (SAP, Oracle, else Beacon) |
| Organizations with `website` / `address` / `biller_email` | 89% / 96% / 1.4% | website presence |
| Organization `custom_fields` keys | `preferredLanguage`, `description`, `oracle_ccnbId`, `annualRevenue`, `sap_s4hanaId`, `employee_count`, `organizationType`, `primaryContactEmail` | Additional details |
| `tier`, `supplier_status`, `supplier_number`, `parent_id` | 0 rows | Supplier card is synthetic, shown only for vendor facet; tiers Preferred / Approved / Conditional, statuses Active / Under review / Suspended |
| `party_addresses.address_type` | service 25,460 · mailing 22,238 · billing 6,135 | every party has service; mailing 85%; billing 25% |
| Accounts per party | 1 for 99.97%, 2 for 21 parties | one account; a 1% chance of two (then "Balances by account" is just two rows in Accounts) |
| `accounts.account_type` | customer 70%, unclassified 29%, vendor 2%, employee 0.3% | Account types chips |
| `accounts.attributes` keys | balance, serviceAddress, accountStatus, pastDueAmount, dueDate, currentBalance, mailingAddress, creditRating, riskScore, averageMonthlyBill, lastPaymentAmount, lastPaymentDate, disconnectProtection, budgetBilling, paymentArrangement, isDelinquent | Account snapshot fields; numbers from `accountsShape.numbers` per persona |
| Contacts per organization | 1: 6,061 · 2: 1,078 · 3: 168 · 4: 26 · 5+: 10; a cluster of 80 orgs at 31–32 | Relationships: weights 1 (80%), 2 (14%), 3 (4%), 4–6 (1.5%), 30–32 (0.5%) |
| Attachments `entity_type` | not profiled further | no documents list (none today either) |

Related records per profile, counts drawn uniformly then skewed low (zero allowed): invoices 0–8, payments 0–6,
tickets 0–4, interactions 0–10. Status vocabularies, amount ranges and date windows reuse `arShape`, `payShape`,
`ticketsShape` and `callsShape` (Finance and Support shapes) so the rows look like the module lists; the row types
reuse `FinanceInvoice`, `FinancePayment`, `SupportTicket` and `SupportCall` column keys where the tab columns name
them. Duplicates: 12% of profiles get 1–2 candidates with confidence 72–96 and signals drawn from
`email`, `phone`, `name + address`.

### 6.3 Timeline

`timeline` is derived, not generated: every invoice (issued; paid when status is paid), payment, ticket (opened;
resolved when resolved/closed) and interaction becomes one or two events, plus two system events ("Record created" at
`row.createdAt`, "Synced from {source}" at `lastSyncedAt` when source is not Beacon). Sorted descending by `at`. The
Activity tab and the Billing / Support tabs therefore never disagree.

### 6.4 Privacy

As before: no dump rows, names, emails, phones, addresses or tenant names in the repo. Everything above is aggregate.

## 7. Labels per persona

Existing `Terms` cover `contacts`, `organizations`, `invoices`, `payments`, `tickets`, `contact`, `organization` and the
facet terms. Add to `Terms` (and to the three persona term maps, values from `industry-config.ts`):

| Key | utilities | financial | government_federal | Where |
|---|---|---|---|---|
| `billingTab` | Bills & Usage | Statements | Statements | Billing tab's first segment label |
| `addressCell` | Service address | Service address | Address | summary strip |

The profile eyebrow is the module title ("Network"), not "Partner Profile". `tickets` already maps to Service requests
for government and financial.

## 8. Gaps

Two new ids in `gaps.ts`; the owner-facing table in the 1.2.0 spec's §8 gets the same two rows appended.

| Gap id | Concept | Where it shows | Why ui-atoms cannot | Rendering |
|---|---|---|---|---|
| `ai-insights` | JAREIS guidance card (recommended actions with confidence, Execute / Useful / False positive / Dismiss) and "Why they're calling" chips | page-level badge on both profiles | no AI card, confidence meter or feedback pattern | badge |
| `mailbox` | Communications tab: message list with channel and status pills beside a details/compose pane | Communications tab | chat and composer parts exist, no split-pane mailbox composition | badge, placeholder tab |

Existing ids reused: `merge-review` (Merge), `charts` (Spend), `pdf-preview` (Send bill copy, invoice Preview),
`filter-builder` (timeline module filter), `flow-builder` (Start/Stop/Transfer), `drag-calendar` (Schedule
appointment), `rich-text` (Notes tab), `map` (page-level, for the dropped outage activity card).

Dropped without a badge, as out of a profile's scope: the organization Billing config tab (a settings form), the
expiring-POs table and lifecycle chevron (flagged Supplier 360 feature), Sources / Undo merge (superseded by the
duplicate alert), Create new account.

## 9. Error handling

- Unknown or stale `id`: list view, no message (§5.1).
- A `DetailSpec` on an item whose rows lack a `link` column: the list renders as today and nothing is clickable; the
  typecheck does not catch this, so the walkthrough asserts that the first contact name is a link.
- `load` throwing: not caught; a generator bug should surface in the console the walkthrough reads.
- Zero related records: each table segment shows its `Empty` copy; an empty timeline shows "No activity yet".

## 10. Verification

- `pnpm --filter playground lint`, `typecheck`, `build`; `pnpm test` at the root. No recipe tests (CLAUDE.md).
- `docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs` gains a `--details` pass: for each persona,
  open `#/network/contacts`, click the first name link, assert the hash has three segments, the h1 is non-empty, the
  breadcrumb's second crumb returns to the list, each of the six tabs renders without console errors, and
  `document.documentElement.scrollWidth === innerWidth` at 1280 and 1024 wide with the inset control off and on; repeat
  for `#/network/organizations`. `routes.txt` is unchanged (detail routes are per-row).
- Manual: switch persona on an open profile and confirm the fallback to the list.

## 11. Out of scope

Second-level detail pages (invoice, ticket, account) and links into them; create and edit dialogs; the Link command
palette; OTP and send-link dialogs; billing configuration; real data; permissions; push history; mobile layouts beyond
no horizontal scroll.
