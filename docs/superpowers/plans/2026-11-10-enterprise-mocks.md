# Enterprise UI/UX mocks (recipe 1.2.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder views of the `enterprise-ui-ux` playground recipe with persona-switchable list mocks for all 33 menu items and real-shaped dashboards for all 7 modules, composed from ui-atoms only, with every ui-atoms gap flagged in the UI.

**Architecture:** A spec-driven mock layer inside the recipe folder: `personas.ts` (nomenclature + seed), `mock/` (seeded generators fed by QA-derived shapes), `specs/` (one `ListSpec` per item and one `DashboardSpec` per module), `views/` (one generic `ListView`, one `DashboardView`, shared cells, gap badges) and `gaps.ts` (the registry). The shell (rail, panel, hash routing) is unchanged; `index.tsx` resolves the route to a spec and passes the persona from a new control-panel select.

**Tech Stack:** React 19, `@tilli.dev/ui-atoms` subpaths, `lucide-react`, TypeScript, Vite playground, Biome. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-enterprise-mocks-design.md`, with appendices `docs/superpowers/specs/2026-11-10-enterprise-mocks/module-maps.md` (columns, chips, actions, QA shapes per item) and `ui-atoms-parts.md` (part APIs). Executors read both.

## Global Constraints

- **No recipe tests, ever** (root `CLAUDE.md`). A task's verification is `pnpm --filter playground lint`, `typecheck`, `build`, and the browser check it names. The registry tests (`apps/playground/__tests__/catalog.test.ts`) must keep passing.
- Build ui-atoms before the playground: `pnpm --filter @tilli.dev/ui-atoms build` (the playground imports `dist/`). Use Node 22.22.2 (`.nvmrc`); run `export PATH=$HOME/.nvm/versions/node/v22.22.2/bin:$PATH` first in this shell.
- Compose from `@tilli.dev/ui-atoms/<subpath>` only, plus `@tilli.dev/ui-atoms/utils` for `cn`, `lucide-react` for icons, `Intl` for formatting (ui-atoms has no date or money formatters). No charts, maps or new libraries: those are gaps (§8 of the spec).
- Do not import `calendar`, `tree`, `carousel` or `resizable` (optional peers the playground lacks).
- Mock data is invented. No QA names, emails, phones, addresses or tenant names anywhere in the recipe (spec §5.1). Shape files carry aggregates only.
- Dates are relative to the fixed anchor `2026-11-10T12:00:00Z`; generators are deterministic for a given persona seed.
- Personas: `utilities` (default), `financial`, `government_federal`. Labels per persona from spec §7.2.
- Biome formats and sorts; run `pnpm lint:fix` from the repo root before each verification. Imports use the `.js` suffix for local modules (see existing recipe files).
- Registry rule: `recipes.json` `components` must equal the exact set of `@tilli.dev/ui-atoms/<x>` subpaths imported anywhere in the recipe folder (`utils` excluded); the catalog test enforces it. Version becomes `1.2.0` with a dated changelog entry (Task 21).
- Item route keys are `itemSlug(item)` from `routing.ts`: label lowercased, spaces to dashes (`AI agents` → `ai-agents`, `Social Hub` → `social-hub`, `Work orders` → `work-orders`, `Agent desk` → `agent-desk`).

## Review Focus

Inputs the spec implies but no automated test exercises; each one is pinned to a browser-check step in the task that owns it.

1. **Persona switch with list state** (Task 6, Task 4): chips, search, segment, sort and page are reset when the persona changes, so a page index past the new row count never renders an empty table.
2. **A chip or search that matches nothing** (Task 4): the item's `Empty` block renders, not a table with no rows, and the footer reads "Showing 0 of TOTAL".
3. **Label functions re-evaluate per persona** (Task 4, Task 6): headers and titles given as `(terms) => string` change on persona switch with no stale memo.
4. **Sorting typed columns** (Task 4): money and date columns sort numerically and chronologically, not as strings; `null` sorts last.
5. **Footer total vs generated rows** (Task 4): when the QA total is smaller than the generated row count the footer shows the generated count; created dates never fall after the anchor date.

---

### Task 1: Spec types, personas and the gap registry

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/specs/types.ts`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/personas.ts`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/gaps.ts`

**Interfaces:**
- Produces (`specs/types.ts`):
  ```ts
  export type PersonaKey = "utilities" | "financial" | "government_federal";
  export type Terms = {
    contacts: string; organizations: string; invoices: string; bills: string; payments: string;
    tickets: string; leads: string; opportunities: string; products: string; outages: string;
    contact: string; organization: string; invoice: string; lead: string; opportunity: string;
    personCustomer: string; personVendor: string; personEmployee: string;
    orgCustomer: string; orgVendor: string; orgEmployee: string;
    createContact: string; createOrganization: string; createLead: string; createOpportunity: string;
  };
  export type Persona = { key: PersonaKey; label: string; tenantName: string; seed: number; currency: "USD"; terms: Terms };
  export type Label = string | ((terms: Terms) => string);
  export type Format = "text" | "money" | "date" | "datetime" | "status" | "party" | "count" | "link" | "boolean" | "duration" | "percent" | "badge";
  export type Row = { id: string } & Record<string, unknown>;
  export type ColumnSpec<R extends Row = Row> = { key: string; header: Label; format: Format; accessor?: (row: R) => unknown; align?: "start" | "end"; sortable?: boolean };
  export type ChipSpec<R extends Row = Row> = { key: string; label: Label; predicate: (row: R) => boolean };
  export type ActionSpec = { label: Label; icon?: LucideIcon; variant?: "default" | "outline" | "ghost" | "destructive"; gap?: GapId };
  export type SegmentSpec<R extends Row = Row> = { key: string; label: Label; rows: (persona: Persona) => R[]; columns?: ColumnSpec<R>[]; chips?: ChipSpec<R>[]; empty?: EmptyCopy; total?: (persona: Persona) => number; gaps?: GapId[] };
  export type EmptyCopy = { title: Label; description: Label };
  export type ListSpec<R extends Row = Row> = { key: string; title: Label; description?: Label; rows: (persona: Persona) => R[]; total?: (persona: Persona) => number; columns: ColumnSpec<R>[]; chips: ChipSpec<R>[]; segments?: SegmentSpec<R>[]; rowActions: ActionSpec[]; pageActions: ActionSpec[]; search: (row: R, query: string) => boolean; empty: EmptyCopy; selectable?: boolean; gaps?: GapId[] };
  export type StatSpec = { label: Label; value: number | string; hint: Label; gap?: GapId };
  export type PanelSpec = { title: Label; description: Label; gap?: GapId } & (
    | { kind: "table"; columns: ColumnSpec[]; rows: Row[] }
    | { kind: "list"; items: { label: string; value: string; hint?: string }[] }
    | { kind: "meters"; meters: { label: string; value: number; max: number; display: string }[] }
    | { kind: "placeholder"; message: string });
  export type DashboardSpec = { stats: StatSpec[]; panels: PanelSpec[] };
  export type ModuleSpecs = { dashboard: (persona: Persona) => DashboardSpec; items: Record<string, ListSpec<any>> };
  export const resolveLabel = (label: Label, terms: Terms): string => typeof label === "function" ? label(terms) : label;
  ```
- Produces (`personas.ts`): `export const personas: Record<PersonaKey, Persona>`, `export const personaKeys: readonly PersonaKey[]`, `export const isPersonaKey(value: string): value is PersonaKey`. Terms per spec §7.2 (utilities: Contacts/Organizations/Invoices/Bills/Payments/Tickets/Leads/Opportunities/Products/Outages, facets Customers/Vendors/Employees and Commercial/Vendors/Internal; financial: Service Requests/Prospects/Deals/Accounts & Services/System Outages, facets Retail Clients/Vendors/Employees and Corporate Clients/Vendors/Internal; government_federal: Constituents/Businesses/Statements/Service Requests/Applicants/Grants/Projects/Government Services/Disaster/Weather, facets Residents/Contractors/Staff and Commercial/Suppliers/Agencies). Tenant display names are invented: `Harbor Light Utilities`, `Meridian Trust Bank`, `Bureau of Civic Services`. Seeds 11, 23, 37.
- Produces (`gaps.ts`): `export type GapId = "charts" | "map" | "softphone" | "flow-builder" | "rich-text" | "drag-calendar" | "kanban" | "data-grid" | "filter-builder" | "file-import" | "merge-review" | "nested-rows" | "nonlinear-stepper" | "time-inputs" | "pdf-preview" | "code-block"`; `export const gaps: Record<GapId, { concept: string; reason: string; rendering: "approximation" | "placeholder" | "badge" | "listed" }>` with the concept and reason text from spec §8, one entry per row.

- [ ] **Step 1: Create the three files** with the exports above. `Terms` keys map 1:1 onto `industry-config.ts` keys (`classification_person_customer` → `personCustomer`, and so on).
- [ ] **Step 2: Verify** — Run: `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0, no diagnostics in the recipe folder.
- [ ] **Step 3: Commit** — `git add apps/playground/src/recipes/enterprise-ui-ux && git commit -m "feat(playground): enterprise mock spec types, personas and gap registry"`

### Task 2: Seeded random helpers and invented name pools

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/random.ts`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/names.ts`

**Interfaces:**
- Produces (`random.ts`):
  ```ts
  export const ANCHOR = new Date("2026-11-10T12:00:00Z");
  export type Weighted<T> = readonly (readonly [T, number])[];
  export type NumRange = { min: number; median: number; max: number };
  export type Rng = { next(): number; int(min: number, max: number): number; bool(p?: number): boolean; pick<T>(items: readonly T[]): T; weighted<T>(items: Weighted<T>): T; range(r: NumRange, decimals?: number): number; daysAgo(min: number, max: number): Date; daysAhead(min: number, max: number): Date; reference(prefix: string, width?: number): string; shuffle<T>(items: readonly T[]): T[] };
  export const createRng = (seed: number): Rng;   // mulberry32
  export const seedFor = (persona: Persona, key: string): number;   // persona.seed * 1000 + a stable hash of key
  ```
  `range` draws a triangular distribution between min and max peaking at median. `reference("INV", 5)` returns `INV-00001`-style strings with the counter advancing per call.
- Produces (`names.ts`): `export const firstNames: readonly string[]` (60), `lastNames` (60), `organizationsByIndustry: Record<PersonaKey, readonly string[]>` (40 each: co-ops and municipal utilities; banks, credit unions, lenders; agencies and bureaus), `streets` (30), `cities` (20 with state codes), `productsByIndustry: Record<PersonaKey, readonly string[]>` (20 each), `staffNames` (16), `agentNames` (8), `serviceAreas` (12), `personName(rng): string`, `emailFor(name: string, org: string): string` (lowercased, `example.com`-style domains only), `phone(rng): string` (555 numbers), `address(rng): string`.

- [ ] **Step 1: Create `random.ts`** with the signatures above.
- [ ] **Step 2: Create `names.ts`**; every string invented; no real company names.
- [ ] **Step 3: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0. Spot check in a scratch script is optional; determinism is proven in Task 6's browser check (reload yields identical rows).
- [ ] **Step 4: Commit** — `git commit -am "feat(playground): seeded rng and invented name pools for enterprise mocks"`

### Task 3: Shared cells and gap markers

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/cells.tsx`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/gap-placeholder.tsx`

**Interfaces:**
- Consumes: `Format`, `GapId`, `gaps`.
- Produces (`cells.tsx`):
  ```ts
  export function Cell({ format, value, currency }: { format: Format; value: unknown; currency: "USD" }): JSX.Element;
  export function StatusBadge({ value }: { value: string }): JSX.Element;      // Badge; tone from statusTone()
  export const statusTone = (value: string): "success" | "error" | "warning" | "info" | "secondary";
  export function Money({ value, currency }: { value: number | null; currency: "USD" }): JSX.Element;   // Intl.NumberFormat, tabular-nums, right aligned
  export function DateCell({ value, withTime }: { value: Date | string | null; withTime?: boolean }): JSX.Element;  // "Nov 3, 2026" / "Nov 3, 2026, 09:14"
  export function PartyCell({ name, subline }: { name: string; subline?: string }): JSX.Element;   // Avatar initials + name + muted subline
  export function GapBadge({ id }: { id: GapId }): JSX.Element;   // Badge variant="warning" "Needs review" inside Tooltip with gaps[id].reason
  ```
  `statusTone`: success for `paid approved completed active connected resolved closed won delivered published confirmed accepted online available`; error for `overdue failed rejected breached lost void disputed dead_letter cancelled offline`; warning for `draft pending pending_review pending_approval pending_payment submitted scheduled invited on_hold waiting escalated held away busy`; info for `sent viewed open in_progress new contacted qualified processing received`; else secondary. Match on the lowercased value with spaces and dashes normalized to underscores.
  `Cell` dispatch: `status` → `StatusBadge`; `badge` → `Badge variant="secondary"`; `money` → `Money`; `date`/`datetime` → `DateCell`; `party` → `PartyCell` (value is `{ name, subline? }`); `count` → tabular number; `percent` → one decimal with `%`; `duration` → `h m` from minutes; `boolean` → "Yes"/"No"; `link` → `Button variant="link" size="sm"`; `text` → string.
- Produces (`gap-placeholder.tsx`): `export function GapPlaceholder({ id, message }: { id: GapId; message: string }): JSX.Element` rendering `Empty > EmptyHeader > EmptyMedia variant="icon" (lucide `Construction`) + EmptyTitle (gaps[id].concept) + EmptyDescription (message)` with `GapBadge` in `EmptyContent`.

- [ ] **Step 1: Create `cells.tsx`** importing from `@tilli.dev/ui-atoms/badge`, `avatar`, `button`, `tooltip`.
- [ ] **Step 2: Create `gap-placeholder.tsx`** importing from `@tilli.dev/ui-atoms/empty`.
- [ ] **Step 3: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0.
- [ ] **Step 4: Commit** — `git commit -am "feat(playground): shared mock cells and gap markers"`

### Task 4: The generic list view

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/list-view.tsx`

**Interfaces:**
- Consumes: `ListSpec`, `SegmentSpec`, `Persona`, `resolveLabel`, `Cell`, `GapBadge`.
- Produces: `export function ListView<R extends Row>({ spec, persona, moduleTitle, Icon }: { spec: ListSpec<R>; persona: Persona; moduleTitle: string; Icon: LucideIcon }): JSX.Element`.

Behavior, all local state keyed on `spec.key + persona.key` (React `key` on the inner component so it remounts on persona change):
- Header: module eyebrow (`moduleTitle` uppercase, as `ItemView` does today), `h1` with `Icon` and the resolved title, optional description, `pageActions` as `Button`s (`variant` default `outline`, icon before label; an action with `gap` gets a `GapBadge` beside it; all inert).
- Segments: `SegmentedControl` when `spec.segments` has entries; the active segment supplies `rows`, and `columns`/`chips`/`empty`/`total` override the list's when set. Default is the first segment.
- Chips: `ToggleGroup` (single, `variant="outline"`, `size="sm"`) with an implicit leading `All` chip; each chip label shows a count in a `Badge variant="secondary" size="sm"` computed over the segment's rows (before search).
- Search: `InputGroup > InputGroupAddon (lucide Search) + InputGroupInput placeholder="Search"`, filtering with `spec.search`.
- Table: `Table` inside a `Frame`; `TableHead` cells for sortable columns render a `Button variant="ghost" size="xs"` with `ArrowUpDown`; click cycles none → asc → desc. Sort compares numbers as numbers, dates as time values, strings with `localeCompare`, `null`/`undefined` last. When `spec.selectable`, a leading `Checkbox` column with a header select-all (`indeterminate` when partial) and, when any row is selected, a `Toolbar` bulk bar above the table reading "N selected" with inert `Button`s "Export" and "Clear selection"; the bar carries `GapBadge id="data-grid"`.
- Row actions: a trailing cell with `Menu > MenuTrigger render={<Button variant="ghost" size="icon" />}` (lucide `Ellipsis`) opening `MenuPopup > MenuItem` per `rowActions` (inert; a gapped action shows the badge inline).
- Footer: `FrameFooter` with "Showing A–B of TOTAL" where TOTAL is `max(total(persona), rows.length)` and `Pagination` with Previous, up to 5 page links, Next; page size 25; `PaginationLink render={<button type="button" />}`.
- Empty: when the filtered set is empty render `Empty` with the resolved `spec.empty` copy in place of the table; the footer reads "Showing 0 of TOTAL".
- `spec.gaps` (and the active segment's `gaps`) render as a row of `GapBadge`s under the header; any id whose `gaps[id].rendering` is `"placeholder"` also renders a `GapPlaceholder` above the table (the softphone dock on Agent desk, the map on Outages, the resource grid on Calendar).

- [ ] **Step 1: Create `list-view.tsx`** with the behavior above. Imports: `table`, `frame`, `toggle-group`, `segmented-control`, `input-group`, `badge`, `button`, `checkbox`, `toolbar`, `menu`, `pagination`, `empty`, `tooltip`.
- [ ] **Step 2: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0. Rendering is verified in Task 6's browser check (nothing routes to it yet).
- [ ] **Step 3: Commit** — `git commit -am "feat(playground): generic list view for enterprise mocks"`

### Task 5: The dashboard view

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/views/dashboard-view.tsx`

**Interfaces:**
- Consumes: `DashboardSpec`, `Persona`, `Cell`, `GapBadge`, `GapPlaceholder`.
- Produces: `export function DashboardView({ spec, persona, title, blurb, Icon }: { spec: DashboardSpec; persona: Persona; title: string; blurb: string; Icon: LucideIcon }): JSX.Element`.

Layout as today's `ModuleHomeView`: header, a `grid sm:grid-cols-2 xl:grid-cols-4` of stat `Card`s (`CardDescription` label, `CardTitle` with `NumberTicker value` when `value` is a number else the string, `CardContent` hint; a `gap` adds `GapBadge`), then a `grid lg:grid-cols-3` of panel `Card`s: `table` → compact `Table` (`variant="card"`, up to 6 rows); `list` → `dl` rows label/value/hint; `meters` → one `Meter` per entry with `MeterLabel` and `MeterValue` showing `display`; `placeholder` → `GapPlaceholder`. A panel `gap` adds `GapBadge` in `CardAction`.

- [ ] **Step 1: Create `dashboard-view.tsx`**. Imports: `card`, `table`, `meter`, `number-ticker`.
- [ ] **Step 2: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0.
- [ ] **Step 3: Commit** — `git commit -am "feat(playground): dashboard view for enterprise mocks"`

### Task 6: Persona control and route wiring

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/specs/index.ts`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/index.tsx` (the `useControl` block for "sidebar style" and the `<main>` branch)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/modules.ts` (drop `ModuleHome`, `home`, `enterpriseHome`; keep `homeOf` returning `{ title, blurb }`)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/views.tsx` (delete `ModuleHomeView`, `ItemView`, `PlaceholderRows`; keep `ContentView`)

**Interfaces:**
- Produces (`specs/index.ts`): `export const moduleSpecs: Partial<Record<ModuleKey, ModuleSpecs>>` — empty object now; each module task adds its entry. `export const specFor = (module: ModuleKey, item?: SectionItem): ListSpec | undefined` using `itemSlug(item)`.
- `modules.ts`: `homeOf(module): { title: string; blurb: string }` keeps the current blurbs; `ModuleHome`, `stats`, `panels` are removed.
- `index.tsx`: `const [persona, setPersona] = useState<PersonaKey>("utilities")`; a `persona` select control `{ value: persona, options: [...personaKeys], persist: true, onChange }` in the "sidebar style" group; `<main>` renders `ListView` when `route.item` and a spec exists, `DashboardView` when no item and `moduleSpecs[active]` exists, and otherwise a temporary `Card` reading "Mock to come" (removed in Task 21).

- [ ] **Step 1: Edit `modules.ts`, `views.tsx`, `index.tsx` and create `specs/index.ts`** as above.
- [ ] **Step 2: Verify** — `pnpm --filter @tilli.dev/ui-atoms build && pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build`. Expected: exit 0.
- [ ] **Step 3: Browser check** — `pnpm dev`, open `/recipes/enterprise-ui-ux`: the control panel (Cmd/Ctrl+K) shows the `persona` select; every route renders "Mock to come"; no console errors.
- [ ] **Step 4: Commit** — `git commit -am "feat(playground): persona control and spec routing for enterprise mocks"`

### Tasks 7–20: one data task and one spec task per module

Module order: Network (7, 8), Sales (9, 10), Finance (11, 12), Support (13, 14), Operations (15, 16), Engage (17, 18), Enterprise (19, 20). Each pair follows the two templates below; the per-module tables after the templates give the values that differ. Row type fields are the column keys of the item's table in `module-maps.md`, camelCased.

#### Data task template (odd tasks)

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/shapes/<module>.ts`
- Create: `apps/playground/src/recipes/enterprise-ui-ux/mock/<module>.ts`

**Interfaces:**
- Produces (`shapes/<module>.ts`): one `TableShape` per table the module's items read:
  ```ts
  export type SourceTenant = "U1" | "U2" | "F1" | "G1" | "any";   // U1 utilities persona tenant, U2 the utilities tenant with the AR volume, F1 financial persona, G1 government persona, any = whole QA
  export type TableShape = { table: string; totals: Record<PersonaKey, number>; source: Record<PersonaKey, { tenant: SourceTenant; borrowed: boolean }>; enums: Record<string, Weighted<string>>; numbers?: Record<string, NumRange>; dates?: { fromDaysAgo: number; toDaysAgo: number } };
  ```
  Values transcribed from the "QA profile" block of the module in `module-maps.md`: enum weights are the QA counts, `totals` the live counts per persona, `borrowed: true` wherever the persona industry had no rows and another tenant's shape is used (spec §7.3).
- Produces (`mock/<module>.ts`): `export const <module>Data = (persona: Persona) => <Module>Data` memoized per persona key, where `<Module>Data` is an object with one typed row array per item (and per segment when segments differ), each generated with `createRng(seedFor(persona, "<module>.<item>[.<segment>]"))`, 40–60 rows, drawing statuses with `rng.weighted(shape.enums.status)`, money with `rng.range`, dates with `rng.daysAgo` inside the shape's window, names from `names.ts`. Dashboard figures are derived from these arrays where a row set exists.

- [ ] **Step 1: Create `shapes/<module>.ts`** from the appendix; keep the table and column names from QA so a reviewer can diff them.
- [ ] **Step 2: Create `mock/<module>.ts`** with the row types and generators.
- [ ] **Step 3: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck`. Expected: exit 0.
- [ ] **Step 4: Commit** — `git commit -am "feat(playground): <module> mock data for enterprise mocks"`

#### Spec task template (even tasks)

**Files:**
- Create: `apps/playground/src/recipes/enterprise-ui-ux/specs/<module>.tsx`
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/specs/index.ts` (add the module's entry)

**Interfaces:**
- Consumes: `<module>Data`, the row types, `ListSpec`, `DashboardSpec`, `gaps`.
- Produces: `export const <module>Specs: ModuleSpecs` with `items` keyed by item slug and `dashboard(persona)`.

Rules for every spec: columns in the order of `module-maps.md` after the verifier corrections; chips are the union of today's tabs and the QA enum values (spec §7.1), with counts; `search` matches the first text column and the reference column, case-insensitive; `empty` copy is today's page copy from the appendix; row and page actions are today's (names from the appendix) with `gap` set per spec §8 (Import → `file-import`, Filters → `filter-builder`, bulk toolbar → `data-grid`, chart panels → `charts`, and so on); labels that the nomenclature changes are `(terms) => terms.<key>` functions.

- [ ] **Step 1: Create `specs/<module>.tsx`** and register it in `specs/index.ts`.
- [ ] **Step 2: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build`. Expected: exit 0.
- [ ] **Step 3: Browser check** — in `pnpm dev`, for each persona: open the module dashboard and every item; confirm the columns and chips match the module's table in the plan and appendix, chips filter, search filters, sort toggles, pagination pages, the persona switch relabels the headers and changes the rows, every gap badge shows its tooltip, no console errors. Review Focus items 1–5 are checked here for the first module (Network) and re-checked on any later module that adds a `money` or `date` sortable column.
- [ ] **Step 4: Commit** — `git commit -am "feat(playground): <module> list and dashboard specs for enterprise mocks"`

#### Per-module values

**Network (Tasks 7–8).** Tables: contacts, organizations, network_partners, network_partner_invitations, network_companies, network_exchanges, network_pre_exchanges. Items: `contacts` (columns name/email/phone/accountNumber/premiseAddress/balance/pastDueDate/createdAt; chips All + the three person facets from `terms`; selectable; page actions Import (`file-import`), Export, `terms.createContact`; row actions Open, Edit, Send message, Link account; gaps `filter-builder`, `data-grid`), `organizations` (contacts' columns plus classification/industry/networkStatus; chips facets + Connected/Invited/Not invited; page actions Import, Export, `terms.createOrganization`; row actions Open, Edit, Invite, Connect; same gaps), `directory` (card grid is out of `ListView`'s shape: render it as a table with logo/displayName/legalName/industry/region/tradesWith/joined/connect columns; page actions none), `activity` (segments Exchanges: direction/documentType/status/partner/createdAt with chips All/Inbox/Outbox + status; Invites: recipient/status/payment/sentAt; row actions Accept, Reject, Open; status weights from QA plus 6 synthetic `transport_delivered` inbound rows). Dashboard stats: `terms.organizations`, `terms.contacts`, Connected on Enterprise, Pending invites, Exchanges awaiting review; panels: Connect requests (list), Recent exchanges (table), Directory matches (list), Network pulse (`meters`, gap `charts`).

**Sales (Tasks 9–10).** Tables: leads, opportunities, pipeline_stages, quotes, orders, order_documents. Items: `leads` (nameCompany/contact/source/status/rating/estimatedValue; chips New/Contacted/Qualified/Unqualified/Converted; page actions Import (`file-import`), Export, `terms.createLead`; row actions Open, Convert, Edit), `deals` (name/amount/stage+probability/closeDate/status/account; chips Open/Won/Lost + stage; page actions Import, `terms.createOpportunity`; gap `kanban` on a "Board" page action), `quotes` (number/name/status/total; chips status; page action Create quote; gap `filter-builder` on search), `orders` (segments Sales/Purchase/Received; columns select/number/type/status/date/party/total/invoiced/uninvoiced; chips status; selectable; page actions Export to CSV, New order; gaps `data-grid`). Dashboard stats: Open deals, Pipeline, Win rate, Quotes awaiting, Orders this month; panels: Pipeline by stage (`meters`, gap `charts`), Quotes expiring (table), Recent orders (table).

**Finance (Tasks 11–12).** Tables: ar, ap, pay, payment_transactions, ledger_entries, chart_of_accounts, products, customer_subscriptions, rate_cards, recurring_invoice_schedules, outreach_messages (AR outbox), network_commercial_* (settlements), bill_inbox_messages. Items: `receivables` (segments Invoices/Recurring/Outbox/Ready to invoice/Partner settlements per spec §4.5; chips status per segment; selectable on Invoices; page actions Create `terms.invoice`, Export; row actions Open, Send, Record payment, Void; gaps `data-grid`, `nested-rows` on settlements with a `Sheet` opened by a "Lines" row action that shows the accrual lines table), `payables` (segments Bills/Inbox/Partner settlements; chips status incl. scheduled, overdue, partially_paid, disputed; page actions Upload bill (`file-import`), Create bill; row actions Open, Approve, Pay, Dispute; Inbox rows carry an Auto badge and attachments count with a Preview action gapped `pdf-preview`), `payments` (date/document/party/amount/method/status/reference; chips source Internal/TilliPay/Terminal + status incl. completed, processing, reversed; no page actions; empty copy from the appendix), `ledger` (segments Journal/Chart of accounts/Trial balance; CoA rows indented by `depth` with gap `nested-rows`; page action Export CSV), `catalogue` (segments Products/Subscriptions/Rate cards; products chips type + Active/Archived; page actions Import (`file-import`), Add item). Dashboard stats: Receivable, Payable, Collected this month, Cash in 30 days, Data health; panels: Aging (`meters`, gap `charts`), Bills to approve (table), Recent payments (table), MRR trend (`meters`, gap `charts`).

**Support (Tasks 13–14).** Tables: tickets, nudge_escalations, outreach_messages (inbound, synthetic), nudge_threads, interactions, agent_status, users. Items: `inbox` (segments Threads/Escalations/Calls per spec §4.7; threads 40 synthetic inbound rows with channels email/sms/chat; escalations with priority ordering; calls with QA interaction types; chips per segment; row actions Open, Assign, Resolve, Reply (gap `rich-text`); page actions Export, Compose (gap `rich-text`)), `tickets` (number/subject/customer/status/priority/sla/assignedTo; chips status groups + My tickets; page action Create `terms.tickets` singular form "Create ticket" via `terms`; row actions Open, Assign, Change status; gap `file-import` on Attach; gap `nonlinear-stepper` listed only), `agent-desk` (a `ListView` over the roster: avatar/name/presence/openTickets; chips presence; page actions Set presence, Phone dock; `gaps: ["softphone"]`, so the CCP dock renders as a `GapPlaceholder` above the roster). Dashboard stats: Inbox unread, Open tickets, SLA at risk, Agents online, Calls today; panels: Hourly call volume (`meters`, gap `charts`), SLA watch (table), Agent status (list), Triage queue (table).

**Operations (Tasks 15–16).** Tables: appointments, staff_profiles, service_offerings, orders (fulfilment service, internal WO), time_entries, outages, service_areas. Items: `calendar` (segments Day/Week; rows are appointments with staff/time/title/customer/status; chips status; page action Book appointment; gap `drag-calendar` in `gaps`), `services` (name/length/location/bookedWith/creates/billing; chips location; page action New service; gap `time-inputs`), `staff` (name/timeZone/bookable/buffers/maxPerDay/billRate/costRate; chips Bookable; page action New staff profile; gap `time-inputs`), `work-orders` (segments Service/Internal; columns per spec §4.6; chips status; selectable; page actions Export, New work order; gap `data-grid`), `timesheets` (order/staff/started/hours/notes/cost; chips Submitted/Approved/Rejected/Costed; row actions Approve, Reject; rows synthetic), `outages` (title via `terms.outages`; columns name/type/area/customers/window/status; chips status + type; page actions Manage areas, Schedule maintenance; gap `map` in `gaps`). Dashboard stats: Appointments today, Work orders open, Timesheets to approve, Active outages; panels: Outage map (`placeholder`, gap `map`), Today's calendar (table), Approval queue (table).

**Engage (Tasks 17–18).** Tables: outreach_campaigns, audience_plans, omni templates, outreach_messages (outbound), social_posts, application_forms, application_submissions. Items: `campaigns` (name/status/channel/group/lastRun/nextRun/modified; chips channel Email/SMS/IVR/WhatsApp + status; page actions Audiences, New campaign; row actions Open, Run now, Edit (gap `flow-builder` on IVR rows), Archive), `audiences` (segments Audiences/Approvals; chips status; page action New audience (gap `filter-builder`); row actions Open, Approve, Reject, Version), `templates` (channel/name/channel/approval/category/system; chips channel + approval; page action New (gap `rich-text`); row actions Open, Edit (gap `rich-text`), Approve), `sent` (channel/recipient/time/name/status; chips status; date-range as a `Select` of presets in the header: Today, 7 days, 30 days, 90 days; page action Compose (gap `rich-text`)), `social-hub` (segments Posts/Schedule/Analytics; Posts columns status/approval/platforms/body/schedule/engagement; Schedule as a table of the week's posts with gap `drag-calendar`; Analytics as a table of platform KPIs with gap `charts`; page action New post (gap `rich-text`)), `applications` (segments Forms/Submissions; forms name/type/status/submissions/createdAt with chips status; submissions applicant/form/contact/status/source/submittedAt with chips incl. pending_payment; page action New form (gap `flow-builder` for the builder); selectable forms with gap `data-grid`). Dashboard stats: Campaigns live, Sent today, Delivery rate, Audiences, Forms published; panels: Campaign performance (`meters`, gap `charts`), Recent sends (table), Templates in review (table). "Reply rate" is dropped (no source, spec appendix).

**Enterprise (Tasks 19–20).** Tables: notifications, memberships (pending), tickets (mine), workflows, workflow_runs, ai_agent_settings, ai usage. Items: `inbox` (segments Notifications/My tickets/Access requests per spec §4.1; chips Unread/All + severity; row actions Open, Mark read; page action Mark all read), `search` (a `ListView` whose rows are search results with group/title/subtitle columns and chips per group: Persons, Organizations, Tickets, Invoices, Payments, Quotes, Subscriptions, Applications; the search box is the primary control; empty copy "Type to search"), `analytics` (segments Revenue/Payments/Aging/Usage; each a table of period rows; chips range presets; `gaps: ["charts"]`), `workflows` (name/status/trigger/executions/lastRun; chips All/Active/Draft/Paused/Archived; page action New workflow (gap `flow-builder`); row actions Open, Run, Pause, Archive), `ai-agents` (segments Agents/Usage/Spend limits; Agents rows runtime settings; Usage rows team/level/spent/budget/policy; Spend limits rows scope/limit/used; page action Save; gap `code-block` on an Embed snippet action). Dashboard stats: Inbox unread, My open tickets, Due this week, Workflows running; panels: My inbox (table), Workflow runs (table), Analytics highlights (list).

### Task 21: Registry bump, cleanup and full walkthrough

**Files:**
- Modify: `apps/playground/recipes.json` (the `enterprise-ui-ux` entry)
- Modify: `apps/playground/src/recipes/enterprise-ui-ux/index.tsx` (remove the "Mock to come" fallback)
- Modify: `docs/superpowers/specs/2026-11-10-enterprise-mocks-design.md` §8 only if a gap id was added or dropped during Tasks 7–20

- [ ] **Step 1: Remove the fallback** in `index.tsx`; `specFor` must now resolve for every item (typecheck `moduleSpecs` as `Record<ModuleKey, ModuleSpecs>`).
- [ ] **Step 2: Update `recipes.json`**: `version` `1.2.0`; append `{ "version": "1.2.0", "date": "2026-11-10", "changes": "Replace the placeholder views with persona-switchable list mocks for all 33 menu items and real-shaped dashboards for all 7 modules, composed from ui-atoms and fed by seeded mock data shaped on the QA database; add a persona control (utilities, financial, government_federal); flag every concept ui-atoms cannot render with a Needs review badge." }`; set `components` to the sorted set of subpaths imported in the folder (compute with `grep -rhoE '@tilli.dev/ui-atoms/[a-z-]+' apps/playground/src/recipes/enterprise-ui-ux | sort -u`, drop `utils`); description updated to mention the mocks and the persona control.
- [ ] **Step 3: Verify** — `pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground test && pnpm --filter playground build`. Expected: exit 0; the catalog test passes on `components` and format.
- [ ] **Step 4: Full browser walkthrough** — all 40 views × 3 personas; the checklist of the spec task template plus: reload on a deep link (`#/finance/receivables`) renders the same rows (determinism), the inset toggle and colorful toggle still work, every `gaps.ts` id appears at least once in the UI except `merge-review` and `nonlinear-stepper` (listed only).
- [ ] **Step 5: Commit** — `git commit -am "feat(playground): enterprise-ui-ux 1.2.0 with list and dashboard mocks"`
