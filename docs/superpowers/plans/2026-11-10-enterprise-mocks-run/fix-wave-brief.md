# Fix wave after the whole-branch review (one dispatch)

Branch feat/version-1.1.0 at 1f6e729. Recipe: apps/playground/src/recipes/enterprise-ui-ux/. Commit as one or a few conventional commits (`fix(playground): …`), Co-Authored-By trailer, headers < 100 chars, body lines < 100 chars, `git add -A apps/playground` before each commit. Verification after all changes: `pnpm --filter @tilli.dev/ui-atoms build` (if dist is stale), `pnpm lint:fix`, `pnpm --filter playground lint`, `typecheck`, `test`, `build` — all must pass. Update `recipes.json` `components` if the import set changes (it will: `sheet`); keep version 1.2.0 and append nothing to the changelog.

## A. Contract: segments are authoritative (views/list-view.tsx, specs/types.ts, specs/finance/common.ts)
1. In `ListView`, when `spec.segments` exists: `chips = segment.chips ?? []`, `selects = segment.selects ?? []`, `rowActions = segment.rowActions ?? []`, `total = segment.total` (undefined → row count). `pageActions`, `selectable`, `search`, `empty`, `gaps`: segment value when defined, else the list's. Add `selectable?`, `pageActions?`, `search?` to `SegmentSpec`.
2. `lead()` in specs/finance/common.ts must stop copying `selects` and `total` to the list level (keep `rows`, `columns`, `chips`? no: keep only `rows` and `columns` and `empty`; the list-level `chips`/`rowActions` still satisfy the required type but are never read when segments exist).
3. Audit EVERY segment in every spec (network Activity; sales Orders; finance receivables/payables/ledger/catalogue; support Inbox; operations Calendar/Work orders; engage Audiences/Social Hub/Applications; enterprise Inbox/Analytics/AI agents) and declare explicitly what each segment needs: Social Hub Schedule keeps the Platform select (declare it); Ledger Chart of accounts and Trial balance get no select; Catalogue Subscriptions and Rate cards get no Status select; Audiences Approvals gets `total` = pending count and `chips: []`; Social Hub Schedule/Analytics get totals = their row counts; Orders Received keeps its own total; every segment whose rows differ from the lead declares its own `total`.
4. Per-segment `selectable`/`pageActions`: Receivables Invoices and Payables Bills keep `selectable`; other segments of those lists set `selectable: false`. Orders Received: `pageActions` without "New order". Inbox Access requests: `pageActions: []`.

## B. Settlement Sheet (spec §4.5 / §8 nested-rows)
1. `ActionSpec` gains `panel?: (row: R) => { title: string; description?: string; columns: ColumnSpec[]; rows: Row[] }` (make `ActionSpec` generic over R where needed, defaulting to `Row`).
2. `ListView` keeps `panelState` (open row + action); clicking a row action that has `panel` opens a `Sheet` (`@tilli.dev/ui-atoms/sheet`: `Sheet open onOpenChange`, `SheetPopup side="right"`, `SheetHeader > SheetTitle + SheetDescription`, body with a compact `Table variant="card"` of the panel rows through `Cell`). The action keeps its gap badge if it has one.
3. Receivables and Payables "Lines" actions get `panel` from `row.lines` (columns description, quantity count, rate money, amount money, sourceRef, eventDate date). Remove the `nested-rows` gap from those actions (the Sheet IS the approximation) but keep `nested-rows` on the Ledger Chart of accounts segment.
4. Add `"sheet"` to `recipes.json` components (sorted).

## C. Enterprise home reads $0 (mock/finance/ar.ts, mock/shapes/finance.ts)
Give the invoice generator a recent band: ~30% of invoices issue within the last 30 days (anchor-relative), and among open/sent/overdue ones at least 6 per persona have `dueDate` within the next 7 days. Comment it like the support call-spread. Keep `dueDate > issueDate`, `createdAt ≤ anchor`, balances consistent. Verify with a scratch run: Enterprise home "Due this week" > 0 and "Latest month invoiced" > 0 for all three personas; Finance dashboard still sane.

## D. Footer totals
1. `ListSpec` and `SegmentSpec` gain `footer?: (rows: R[], persona: Persona) => { label: string; value: string }[]` (rows = the filtered set). `ListView` renders the pairs in the footer line before the paging text, as `label value` separated by " · ".
2. Use it on: Sales › Orders (all three segments: "Total", "Invoiced", "Uninvoiced" sums as compact money, per currency label "USD"), Operations › Work orders (Service: Total/Invoiced/Uninvoiced; Internal: Total), Finance › Ledger › Trial balance (Total debit, Total credit from `buildTrialBalance` totals or summed from rows).

## E. Cheap triage items
1. `ListView`: render the Actions column and its menu only when `rowActions.length > 0`.
2. Network › Organizations: add a Connect row action (spec §4.2).
3. Finance › Catalogue › Products: add a SKU column (text) after Name; keep the sku subline.
4. Create `specs/common.ts` and `mock/common.ts` holding the helpers now duplicated (`DAY`, `includes`, `capitalise`, `compactMoney`, `statusChips`, `empty`, `adjust`, `searchBy`, `lead`, `AnyList`, `sameDay`; mock side: `weights`, `tenantOf`, `plusDays`, `byDateAsc`, `numberRange`, `paidAmount`, `documentDates`, `partyName`, `windowOf`); re-export from the old `finance/common` locations so existing imports keep working; delete the private copies in network.tsx, sales.tsx, support.tsx, engage.tsx and mock/engage.ts.
5. Remove the `as never` casts at mock/operations.ts:239 and mock/support.ts:686, :704 by typing the shapes' enums properly.
6. `GapBadge`: make the trigger focusable (`tabIndex={0}` on the rendered Badge) so the tooltip reaches keyboard users.
7. `DateCell`: pass `timeZone: "UTC"` to both Intl formats so rendered dates match the UTC day filters.
8. Support › Tickets and Enterprise › My tickets SLA column: resolved/confirmed/closed with a due date render "Met" (status tone success) instead of "On track".
9. `ListView` key: `${moduleTitle}:${spec.key}:${persona.key}` so Enterprise › Inbox and Support › Inbox do not share state.
10. `index.tsx` persona control: keep the keys as values but it is fine as is if the control only accepts strings; if the control supports labels, show `Persona.label`; otherwise leave and note it.

## Not in scope
Everything else in the final review's Minor list and "can wait" triage stays deferred (do not touch): analytics range presets, time-zone of other formats, seed hash width, sparse revenue months beyond item C, file splits, stats that do not change per persona, gap placement differences, Beacon product name in copy.
