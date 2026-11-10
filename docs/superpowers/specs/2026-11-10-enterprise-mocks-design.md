# Enterprise UI/UX recipe: list and dashboard mocks (recipe 1.2.0)

**Date:** 2026-11-10. **Status:** design, awaiting owner review. **Repo:** `~/tilli/ui-atoms`, branch `feat/version-1.1.0`.
**Appendices (same folder, `2026-11-10-enterprise-mocks/`):** `module-maps.md` (what every menu item shows today in
beacon-enterprise, verified column by column, plus the QA data profile per table and persona) and `ui-atoms-parts.md`
(the ui-atoms API inventory a builder composes from).

## 1. Goal

Turn the `enterprise-ui-ux` playground recipe (`apps/playground/src/recipes/enterprise-ui-ux/`) from a shell with
placeholder views into primitive mocks of the whole authenticated Enterprise UI: every one of the 33 module menu items
gets a list view and every one of the 7 modules gets a dashboard with real-shaped widgets. The mocks are composed from
`@tilli.dev/ui-atoms` parts only. Any concept of today's beacon-enterprise UI that a simple composition of ui-atoms
parts cannot render is marked in the UI and listed for the owner's review.

Mock data mirrors what beacon-enterprise shows in QA today: the same columns, the same status vocabularies and their
real distributions, the same magnitudes, with invented names. It is switchable between three industry personas from
the playground control panel.

Success means: the owner can open any module, click any menu item, switch persona, and see a list that looks like the
real thing would after the redesign, with every ui-atoms gap visibly flagged; `lint`, `typecheck` and `build` pass.

## 2. Inputs

- `~/tilli/beacon-enterprise/docs/v2/recon/2026-11-10-authenticated-ui-duplication-recon.md`: the module model (one home per table,
  modules as lenses, rules 1-7, open points).
- `~/tilli/beacon-enterprise/docs/v2/reference/plans/work/beacon-web-audit/` (`01-routes.md`, `02-navigation.md`, `03-intent.md`).
- `~/tilli/beacon-enterprise/docs/v2/recon/2026-11-10-qa-data-profile.md` and the local read-only QA dump
  (`postgres://qa_ro:qa_ro@127.0.0.1:5499/beacon_qa`, container `beacon-qa-ref`).
- `apps/web/src/lib/industry-config.ts` in beacon-enterprise: the nomenclature maps.
- The appendices above, produced on 2026-11-10 by 7 module readers, 7 QA profilers and 7 verifiers.

## 3. Owner decisions (2026-11-10)

| # | Decision |
|---|---|
| D1 | Scope: all 33 list views and all 7 dashboards. Fidelity: lists and dashboards only; no detail pages, no create/edit forms. |
| D2 | Personas switchable from the control panel: utilities, financial, government_federal. |
| D3 | Placement: inside `enterprise-ui-ux`, version 1.2.0. Gaps shown in the UI as a `Needs review` badge on the affected element, and listed in this spec (§8). |
| D4 | Unplaced surfaces: JAREIS Radar is out (no QA tenant enables it). Bulk record consolidation (renamed from Record Consolidation), Notification settings, Beacon support and Payment gateway settings (renamed from TilliPay) belong under Settings and get no mock. Command Console, CSR console and SQL audience segments: see §9, none is in today's sidebar. |
| D5 | Contracts are out. |
| D6 | Work and service orders share one Operations item; Ready to invoice becomes a chip on Finance › Receivables (§4.6). |
| D7 | Support dashboard gets the call KPIs and hourly volume; Agent desk gets the softphone, presence, roster and queue. Enterprise › Inbox is notifications, my tickets and access requests, not customer threads. |
| D8 | Thin QA data: each list's shape comes from the QA tenant richest in that list's tables, chosen per persona and per item, borrowing from another industry's tenant when the persona industry has none (§7.3). |

## 4. Information architecture of the mocks

The rail, module panel and hash routing stay as they are (`#/<module>` is the dashboard, `#/<module>/<item>` a list).
Items that absorb several of today's pages get a **segment** (SegmentedControl) for the sub-list; every list gets
**chips** (ToggleGroup) that replace today's `?status=` and `?facet=` sidebar tabs and in-page button groups, with the
full status vocabulary seen in QA, not today's partial tab sets.

Column lists, chip values, actions and empty copy for each item are in `module-maps.md`; this section fixes the
structure. "Label" means the industry nomenclature applies (utilities / financial / government_federal).

### 4.1 Enterprise (brand square)

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Inbox | Notifications · My tickets · Access requests | Unread/All; severity | D7. Notifications: dot, severity, title, body, time. My tickets: #, subject, status, priority, SLA. Access requests: name, email, requested. |
| Search | none | result groups | Search box plus grouped result cards: Persons, Organizations, Tickets, Invoices, Payments, Quotes, Subscriptions, Applications; each row title, subtitle, Open. |
| Analytics | Revenue · Payments · Aging · Usage | range presets (7d, 30d, 90d, 12m) | Stat rows plus tables; the charts are gaps (§8) rendered as Meter stacks. |
| Workflows | none | All, Active, Draft, Paused, Archived | Name, Status, Trigger, Executions, Last run. |
| AI agents | Agents · Usage · Spend limits | none | Agents: runtime settings summary cards. Usage: spent of budget, by team table with Meter bars. Spend limits: budget rows. |

### 4.2 Network

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Contacts (label) | none | All, Customers, Vendors, Employees (labels) | select, Name, Email, Phone, Account #, Premise address, Balance, Past due, Created. Footer "Showing N of TOTAL". |
| Organizations (label) | none | same four, plus Network: Connected, Invited, Not invited | Organizations plus the NetworkPartners columns: Classification, Industry, Network status; Invite / Connect row actions (recon rule 2). |
| Directory | none | none | Card grid: logo, display name, legal name, industry, region, trades with, joined, Connect. Search box. |
| Activity | Exchanges · Invites | All, Inbox, Outbox; status | Direction, Document type, Status, Partner (resolved to organization name), Created, Accept / Reject on pending inbound rows. Invites: Recipient, Status, Payment, Sent. QA has no pending exchange, so pending rows are synthetic. |

### 4.3 Engage

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Campaigns | none | channel: Email, SMS, IVR, WhatsApp; status | Campaign, Status, Channel, Group, Last run, Next run, Modified. |
| Audiences | Audiences · Approvals | status (draft, pending approval, approved, rejected, archived, superseded) | Audience, Status, Accounts, Version, Updated. |
| Templates | none | channel; approval | channel icon, Name, Channel, Approval, Category, System. |
| Sent | none | status (sent, delivered, opened, failed, pending) | channel icon, Recipient, Time, Name (campaign name when present), Status. Date range as a Select of presets. |
| Social Hub | Posts · Schedule · Analytics | status; platform | Posts as cards (status, approval, platforms, body, schedule, engagement). Schedule is a gap (drag calendar) rendered as a week list. Analytics: KPI tiles and platform table; charts are gaps. |
| Applications | Forms · Submissions | forms: status; submissions: status including pending_payment | Forms: Name, Type, Status, Submissions, Created. Submissions: Applicant, Form, Contact, Status, Source, Submitted. |

### 4.4 Sales

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Leads (label) | none | New, Contacted, Qualified, Unqualified, Converted | Name / Company, Contact, Source, Status, Rating, Est. value. |
| Deals (label) | none | Open, Won, Lost; stage | Deal, Amount, Stage / Probability, Close date, Status, Account (organization, filled in; today it is a dash). Stages from `pipeline_stages`. |
| Quotes | none | status | Quote, Name, Status (badge), Total (money). |
| Orders | Sales · Purchase · Received | status; type | select, Order, Type, Status, Date, Customer / Supplier, Total, Invoiced / Billed, Uninvoiced / Unbilled; footer totals per currency. |

### 4.5 Finance

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Receivables (label) | Invoices · Recurring · Outbox · Ready to invoice · Partner settlements | status (draft, open, sent, viewed, overdue, partially paid, paid, written off, void); source | Invoice #, Status, Source, Customer, Issue date, Total, Due. Recurring: Template #, status, frequency, customer, next run. Outbox: recipient, document, channel, status, sent. Ready to invoice: order, customer, unbilled, Invoice now. Partner settlements: period, partner, accrued, settled, disputes; the accrual lines open in a Sheet. |
| Payables (label) | Bills · Inbox · Partner settlements | status (draft, pending review, on hold, rejected, approved, scheduled, partially paid, paid, overdue, disputed, void) | Bill #, Status, Vendor, Issue date, Total, Due. Inbox: sender, Auto badge, subject, attachments, received. |
| Payments | none | source: Internal, TilliPay, Terminal; status including completed, processing, reversed | Date, Document, Party, Amount, Method, Status, Reference. |
| Ledger | Journal · Chart of accounts · Trial balance | account type; status | Journal: Date, Journal #, Description, Account, Category, Debit, Credit, Balance, Status. CoA: Code, Name, Type, Balance (depth-indented, a gap). Trial balance: Code, Name, Debit, Credit, totals. |
| Catalogue (label on Products) | Products · Subscriptions · Rate cards | products: type, status (active, archived); subscriptions: status | Products: type badge, source badge, name, default price, SKU, category. Subscriptions: #, customer, plan, status, next bill, amount. Rate cards: name, currency, rates, effective. |

### 4.6 Operations

Today's "Work orders" (internal, cost centre, requester, `WO-`) and "Service orders" (customer, billable, created from
bookings) are both work orders in the field-service sense: Salesforce Field Service, Dynamics 365 Field Service,
ServiceNow FSM and IBM Maximo all use **work order** as the umbrella; SAP alone calls the customer-facing one a service
order. The item therefore stays **Work orders** with a **Service · Internal** segment. The owner may rename the segments
(for example Customer · Internal).

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Calendar | Day · Week | staff select; status | The resource grid is a gap; the mock renders a per-staff table of the day's appointments (time, title, customer, status) with a Book appointment action. |
| Services | none | location | Name, Length, Location, Booked with, Creates, Billing. |
| Staff | none | bookable | Name, Time zone, Bookable, Buffers, Max per day, Bill rate, Cost rate. |
| Work orders | Service · Internal | status (draft, scheduled, in progress, completed, closed, cancelled) | select, Order, Status, Billing (service) / Cost centre (internal), Date, Customer / Requester, Total, Invoiced, Uninvoiced; footer totals. |
| Timesheets | none | Submitted, Approved, Rejected, Costed | Order, Staff, Started, Hours, Notes, Cost; Approve / Reject row actions. QA has one submitted entry, so rows are synthetic. |
| Outages (label) | none | status; type | Outage, Type, Area, Customers, Window / ERT, Status. The map is a gap. Labelled Outages / System outages / Disasters per persona. |

### 4.7 Support

| Item | Segments | Chips | Notes |
|---|---|---|---|
| Inbox | Threads · Escalations · Calls | threads: unread, channel; escalations: status, priority; calls: direction, type | Threads: channel icon, from, subject / preview, time, status. Escalations: Subject, Contact / Org, Confidence, Priority, Status, Assigned, Age. Calls: type, direction, party, duration, agent, started. QA has no inbound threads, so threads are synthetic. |
| Tickets (label) | none | status groups (open, in progress, waiting, escalated, resolved, closed); My tickets | #, Subject, Customer, Status, Priority, SLA, Assigned. |
| Agent desk | none | none | Presence control (Select), team roster table (presence dot, name, presence, open tickets), my queue list, and the softphone dock as a gap placeholder. |

### 4.8 Dashboards

Each module root keeps the current layout: a row of stat cards and a row of panels. Stats and panels now come from a
per-module `DashboardSpec` (title, value, hint; panel title, description, rows). Where the recon redistributes a
home-Dashboard widget (rule 1), it lands as follows: contact-center KPIs and hourly volume on Support (D7), the
softphone and agent status on Agent desk, data health and MRR on Finance, the outage map on Operations, my tickets and
the inbox on Enterprise. Charts render as Meter stacks and carry the gap badge; the map and the softphone render as an
Empty placeholder with the badge.

## 5. Architecture

Everything lives in the recipe folder. The shell files (`index.tsx`, `rail.tsx`, `panel.tsx`, `routing.ts`,
`theme.ts`, `icons.ts`) are unchanged except where noted.

```
apps/playground/src/recipes/enterprise-ui-ux/
  index.tsx          adds the persona control and passes persona + specs to the views
  modules.ts         unchanged menus; `home` sample copy is replaced by DashboardSpec references
  views.tsx          ModuleHomeView / ItemView become thin wrappers over views/*
  personas.ts        the three personas: key, display name (invented), nomenclature map, currency, seed
  mock/
    random.ts        seeded PRNG (mulberry32) and pick / weighted / range / date helpers
    names.ts         invented pools: people, organizations, streets, products, staff, agents
    shapes/<module>.ts   per table: enum weights, numeric ranges, totals per persona, source tenant, borrowed flag
    <module>.ts      generators: (persona) → rows per item and segment, memoized per persona
  specs/
    types.ts         ListSpec, ColumnSpec, ChipSpec, SegmentSpec, DashboardSpec, Gap
    <module>.tsx     ListSpec per item and the module's DashboardSpec
  views/
    list-view.tsx    the generic list composition
    dashboard-view.tsx
    cells.tsx        StatusBadge, Money, DateCell, PartyCell, CountCell, GapBadge
    gap-placeholder.tsx
  gaps.ts            the gap registry (id, module, item, concept, reason), the source of §8
```

### 5.1 Data layer

- **Personas** (`personas.ts`): `utilities`, `financial`, `government_federal`. Each carries the nomenclature map copied
  from `industry-config.ts` (contacts, organizations, invoices, bills, payments, tickets, leads, opportunities, products,
  outage terms, facet labels), an invented tenant display name, currency `USD`, and a numeric seed.
- **Shapes** (`mock/shapes/*.ts`): transcribed from the QA profile in `module-maps.md`: for each table the enum columns
  with weights, numeric columns with min / median / max, created-date ranges, the live total per persona, the source
  tenant per persona (D8) and whether the shape was borrowed from another industry's tenant. Shapes hold aggregates only.
- **Generators** (`mock/<module>.ts`): pure functions `(persona) => Rows` using `random.ts` seeded with
  `persona.seed + itemIndex`, so every list is deterministic across reloads and personas differ. Dates are relative to
  a fixed anchor, `2026-11-10`, so "3 days ago" never drifts. Each list generates up to 60 rows; the footer total is the
  QA live total for the chosen source tenant, scaled to the persona.
- **Privacy**: no QA names, emails, phones, addresses or tenant names anywhere; `names.ts` is invented.

### 5.2 Specs and views

- `ListSpec`: `{ title, labelKey?, segments?, chips, columns, rowActions, pageActions, empty, search }`.
  `ColumnSpec`: `{ header, accessor, format }` with formats `text | money | date | datetime | status | party | count |
  link | boolean | duration | percent | badge`. Chips carry a predicate over rows so filtering is real.
- `ListView` renders: header (industry label, "Showing N of TOTAL", page actions as Buttons), optional
  SegmentedControl, ToggleGroup chips with counts, InputGroup search, Table (sortable headers, optional select column
  with a bulk bar), footer Pagination (25 per page), Empty state with the item's copy when a filter matches nothing,
  row-action Menu. Segment, chips, search, sort and pagination work on the generated rows; create, import, export and
  bulk actions render but are inert.
- `DashboardView` renders stat Cards (NumberTicker for the figure, hint below) and panels (Card with a compact Table,
  a list, or a Meter stack), plus gap placeholders.
- `GapBadge` renders a `Badge` (`warning`, text "Needs review") wrapped in a `Tooltip` with the gap's reason; it sits
  next to the element it replaces or approximates, and `GapPlaceholder` is an `Empty` block with the badge for
  concepts with no approximation.

### 5.3 Control panel

A new `persona` Select (persisted) in the "sidebar style" group, values `utilities | financial | government_federal`,
default `utilities`. Existing controls are untouched.

### 5.4 Registry

`recipes.json`: version `1.2.0`, a changelog entry dated 2026-11-10, and `components` extended to the exact set of
`@tilli.dev/ui-atoms/<x>` subpaths the folder imports (expected additions: badge, button, empty, input-group, meter,
number-ticker, pagination, segmented-control, select, separator, sheet, table, toggle-group, tooltip; verified by the
catalog test).

## 6. Error handling

The mocks have no I/O. The only failure modes are a persona or route value outside the known set, which fall back to
`utilities` and to the module dashboard as today, and a generator producing zero rows for a chip, which renders the
item's Empty state.

## 7. Mock data rules

### 7.1 Columns and vocabularies

Columns, their order and formats are those in `module-maps.md`, after the verifiers' corrections. Status chips use the
union of today's tabs and the values present in QA (for example Payables adds scheduled, overdue, partially paid and
disputed; Leads adds Unqualified and Converted; Submissions adds pending_payment).

### 7.2 Labels per persona

From `industry-config.ts`: utilities Contacts / Organizations / Invoices / Bills / Tickets / Leads / Opportunities /
Products / Outages; financial Contacts / Organizations / Invoices / Bills / Service Requests / Prospects / Deals /
Accounts & Services / System Outages; government_federal Constituents / Businesses / Statements / Bills / Service
Requests / Applicants / Grants/Projects / Government Services / Disaster/Weather. Facet labels follow the
`classification_*` entries. Because government_federal calls invoices "Statements", the partner-settlement segment is
always "Partner settlements".

### 7.3 Source tenant per list (D8)

For each (persona, item) the shape comes from the tenant of that industry with the most live rows in the item's main
table (utilities: `beacon` for most lists, the high-AR utilities tenant for Receivables and Payments; financial: the
richest financial tenant throughout; government_federal: its single tenant). Where that industry has nothing
(government_federal operations, utilities campaigns and audiences, every persona's inbound threads, pending exchanges
and submitted timesheets) the shape is borrowed from the richest tenant of any industry and marked `borrowed` in the
shape file, with volumes scaled to the persona.

### 7.4 Magnitudes

Money ranges, hours, counts and date spreads follow the profile's min / median / max per table. Dashboard figures are
computed from the generated rows where a row set exists (counts, sums, overdue) and otherwise taken from the profile.

## 8. Gaps for owner review

Each entry is a `gaps.ts` id, rendered where stated. "Approximation" means the mock shows a ui-atoms stand-in with the
badge; "placeholder" means an Empty block with the badge.

| Id | Concept | Where it shows | Why ui-atoms cannot do it simply | Rendering |
|---|---|---|---|---|
| charts | Trend / area / bar charts (MRR sparkline, aging, revenue and payments by month, hourly call volume, pipeline by stage, social analytics, campaign performance) | Enterprise › Analytics; Finance, Sales, Support, Engage dashboards | no chart part | approximation: Meter stacks |
| map | Outage / disaster map with markers and boundaries | Operations dashboard | no map part | placeholder |
| softphone | Amazon Connect CCP dock, dialpad, call controls | Support › Agent desk | third-party iframe, no dialpad part | placeholder |
| flow-builder | Workflow builder canvas; IVR flow editor | Enterprise › Workflows (row action); Engage › Templates (IVR) | node/edge canvas with drag and drop | row action inert, badge on the action |
| rich-text | Email / MJML editor, HTML preview, template editors per channel, call script editor | Engage › Templates, Sent compose; Support › Inbox compose | WYSIWYG and sandboxed HTML | badge on the action |
| drag-calendar | Social content calendar; staff resource calendar; reschedule slot picker | Engage › Social Hub › Schedule; Operations › Calendar | the calendar part is a date picker | approximation: week list / per-staff table |
| kanban | Deals pipeline board | Sales › Deals | no board part | approximation: stage chips + table |
| data-grid | Select-all across pages, sticky bulk bar, column chooser, per-currency footer totals, virtualization at 5M rows | Contacts, Organizations, Orders, Work orders, Receivables | the table part has no selection, column visibility or virtualization | approximation: select column + simple bulk bar; footer totals hand-built; badge on the toolbar |
| filter-builder | Progressive filter panel (operator + value, between, tri-state, custom fields), applied-filter chips, query syntax in search (`balance > 500`) | Contacts, Organizations, Quotes | composite builder, not one part | approximation: plain chips and search; badge on the Filters button |
| file-import | CSV import wizard with column mapping; bill PDF drop zone; audience CSV feed; ticket attachments | Contacts, Organizations, Leads, Deals, Products, Payables, Campaigns, Tickets | no file drop zone or mapper grid | badge on the Import action |
| merge-review | Duplicate merge: pick survivor, field-by-field compare | (Settings, not mocked) | bespoke diff view | listed only |
| nested-rows | Expandable statement rows with accrual sub-table; depth-indented chart of accounts | Receivables / Payables partner settlements; Ledger › Chart of accounts | row expansion and tree grid | approximation: Sheet side panel; indentation by padding |
| nonlinear-stepper | Ticket status stepper with branches (waiting, escalated, reopened) | Support › Tickets (row detail, not mocked) | the stepper is linear | listed only |
| time-inputs | Time zone select, duration input, weekly hours editor | Operations › Services, Staff | no timezone, duration or time part | approximation: Combobox / NumberField |
| pdf-preview | Attachment and PDF viewer | Payables › Inbox | no viewer part | badge on the Preview action |
| code-block | Embed snippet and system prompt with copy | Enterprise › AI agents | no code-block part | approximation: monospace Textarea |

## 9. Surfaces left out, with where they are today

- **JAREIS Radar** (`/dashboard/jareis`): an AI "radar" dashboard with Communication health, Payment conversion,
  Chargeback reconciliation, Engagement alerts and Anomalies sections, shown only when the tenant's AI agent settings
  enable the `radar_dashboard` surface. No QA persona enables it. Out (D4).
- **Command Console**: a natural-language command box on the home Dashboard whose runs open `/command-results/:id`.
  It is not a sidebar item and is not admin-only: the Dashboard JSX renders the collapsible for every user
  (`Dashboard.tsx:1261`), with no permission check around it. Out of the mocks; the owner may later place it under
  Enterprise › Search or AI agents.
- **CSR console** (`/csr-console`): behind the `VITE_CSR_CONSOLE_ENABLED` flag, no sidebar entry, reachable only by URL.
  Out.
- **SQL audience segments** (`/settings/audience-segments`): a route with no sidebar entry and no in-app link. Out;
  belongs with Settings.
- **Settings-bound, no mock (D4)**: Bulk record consolidation, Notification settings, Beacon support, Payment gateway
  settings, and the rest of today's ADMIN group and Settings tabs.
- **Contracts** (D5), the Marketing hub (route hidden), Nudge IVR scaffold, the Nudge agent panel (deleted by rule 5).

## 10. Verification

- `pnpm --filter @tilli.dev/ui-atoms build`, then `pnpm --filter playground lint`, `typecheck`, `test` (registry and
  catalog tests only; recipes never get tests, per `CLAUDE.md`), `build`.
- A browser walkthrough of all 40 views in each persona (120 screens), checking: the view renders, chips filter, search
  filters, pagination pages, the persona switch relabels and reseeds, every gap badge has a tooltip, no console errors.
- The appendices stay the reference: a verifier compares each rendered list's columns and chip set against
  `module-maps.md`.

## 11. Out of scope

Detail pages, create and edit forms, real data fetching, permissions and feature flags, mobile layouts beyond what the
shell already does, and any change to `@tilli.dev/ui-atoms` itself (gaps are reported, not filled).
