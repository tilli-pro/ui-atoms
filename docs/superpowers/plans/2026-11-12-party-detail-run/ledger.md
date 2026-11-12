# SDD ledger — plan: docs/superpowers/plans/2026-11-12-party-detail.md

Spec: docs/superpowers/specs/2026-11-12-party-detail-design.md. Branch feat/version-1.1.0, in place (no worktree; see memory on core.bare flips). Models: Sonnet implementers, Opus 5.5 medium task reviewers, Opus high final review.

## Pre-flight scan

| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1 ↔ T2 | TimelineEvent, Persona, Row | match |
| T1 ↔ T3 | TabSpec/TabContent (placeholder carries gap) | match |
| T1 ↔ T4 | DetailSpec.menu(persona), CardContent, BadgeTone | match |
| T1 ↔ T5 | ListSpec.detail: DetailSpec<R, any>; factory returns DetailSpec<Contact|Org, PartyDetail> | assignable (contravariant row param) |
| T2 ↔ T5 | Profile* row keys vs tab column keys; ACCOUNT_PREFIX export | match |
| T3 ↔ T4 | DetailTabs({tabs, d, persona}) | match |
| T4 ↔ T6 | DetailView props (spec,row,persona,moduleTitle,itemLabel,Icon,backHash,onNavigate) | match |
| T5 ↔ T6 | itemSpec.detail, itemSpec.rows(persona), ListView.onOpenRow | match |
| T6 ↔ T7 | walkthrough clicks `main tbody tr:first-child button` | CONFLICT: contacts/organizations lists are `selectable`, so the row's first button is the checkbox |
| T1 self | Terms gains 2 keys; all 3 persona maps updated in the same task | consistent |
| T2 self | probe script asserts determinism + bounds; ids via rng.int (reference() is a counter) | consistent |
| T4 self | RowPanel extraction + cells.tsx tone maps + past_due word | consistent |
| T3–T6 | registry components drift until T7 | allowed by Global Constraints (tasks run lint/typecheck/build; T7 runs pnpm test) |

Ruling: T7 clicks `main tbody tr:first-child button:not([role='checkbox'])` — the first non-checkbox button in the row is the name link — costs nothing if wrong beyond a failing walkthrough line.

## Progress
Task 1: complete (commits ffd4ffb..3f6fd2f, review clean)
Task 2: review (d2e421a): 2 Important, 8 Minor.
Ruling: the "Invoice paid" timeline event is dated at the linked payment's date, clamped to ANCHOR (not the brief's "at dueDate") — the spec's §6.3 rule that the timeline never disagrees with its records outranks the plan's wording — costs nothing if wrong beyond a one-line date change.
Ruling: contacts without an account get no invoices and no payments (tickets and interactions still allowed) — the Account card would otherwise contradict the Billing tab (reviewer minor 3, spec §6.1 "zero figures") — costs a few empty Billing tabs on contact profiles.
Task 2: minor (deferred): utilities preferredLanguage custom field and preferences.language are separate draws (detail.ts ~517/571).
Task 2: minor (deferred): contact duplicate email built from another person's name with the contact name as domain (detail.ts ~685).
Task 2: minor (deferred): utilities payments with no paid invoice use the borrowed G1 payShape amount (~$55k) beside ~$200 invoices (plan-mandated).
Task 2: minor (deferred): email/sms/chat interactions carry a phone fromTo and a duration (plan-mandated wording).
Task 2: minor (deferred): hard-coded copies of shape windows (detail-related.ts ~162, detail.ts ~504, ~719).
Task 2: minor (deferred): needless `platform as string` cast (detail.ts ~669).
Task 2: minor (deferred): detail.ts 504 lines after the split (types ~140 lines).
Task 2: note: timeline ids are `event-${i}` not `${kind}-${i}`; accepted (unique, nothing keys on the prefix).
Task 2: fix round 1/5 (3 addressed, 0 open — paid-event date, latest lastPayment, no billing without account; commits d2e421a..7d91ab5)
Task 2: complete (commits 3f6fd2f..7d91ab5, review clean after 1 fix round)
Task 3: review (82f8f1b): 2 Important, 3 Minor.
Ruling: timeline item dates are formatted in UTC like the day headings and `sameDay` (mock dates are UTC-anchored) — one grouping rule, no viewer-zone drift — costs nothing if wrong beyond a formatter option.
Ruling: the brief's "same markup as the list view" is satisfied by extracting shared `SortableHead` and `ListPagination` components into `views/table-parts.tsx` used by both views, not by a verbatim copy (reviewer Important 2, plan-mandated) — costs a small edit to list-view.tsx.
Task 3: minor (deferred): `useTranslate` named like a hook but is not one; detail-timeline builds its own `t` (detail-tabs.tsx ~54, detail-timeline.tsx ~60).
Task 3: minor (deferred): day-heading <p> inside Timeline breaks the `has-[+[data-completed]]` connector colouring and lacks the `ms-8` inset (detail-timeline.tsx ~109).
Task 3: minor (deferred): tab table row-action MenuItems have no onClick (inert until panels arrive).
Task 3: fix round 1/5 (2 addressed, 0 open — UTC item dates; shared table-parts.tsx used by list-view and detail-tabs; commits 82f8f1b..792a746). Controller headless check: contacts list sorts both ways and pages 1–25 → 26–48 of 107, 0 console errors.
Task 3: complete (commits 7d91ab5..792a746, review clean after 1 fix round)
Task 4: review (3e07674): approved, 0 Important, 7 Minor. ⚠️ resolved by controller: BreadcrumbLink renders an <a> via useRender and merges href/onClick (breadcrumb/index.tsx:36-50); no attribution trailers in the branch commits (grep count 0).
Task 4: minor (deferred): `action as ActionSpec<R>` casts unnecessary (contravariant R); type panel state as `{ row: Row; action: ActionSpec }` (detail-view.tsx ~181, 250, 285, 317).
Task 4: minor (deferred): CardBody `default` arm stands in for `case "placeholder"`; add an exhaustiveness check (detail-view.tsx ~489).
Task 4: minor (deferred): action-button markup repeated in header, alert and list page actions; a shared ActionButton would prevent drift.
Task 4: minor (deferred): React keys by resolved label for badges/menu items/list items are not guaranteed unique.
Task 4: minor (deferred): header left column lacks min-w-0 / break-words; an unbreakable long title or subtitle could overflow (detail-view.tsx ~224-229).
Task 4: minor (deferred): `Icon` prop accepted but unused (plan-mandated prop).
Task 4: minor (deferred): an empty summary still renders an empty Card.
Task 4: complete (commits 792a746..3e07674, review clean)
Task 5: review (4da4481): approved, 0 Important, 10 Minor. ⚠️ resolved: the view hides empty-`fields` cards (Task 4 review, detail-view.tsx ~411).
Ruling: the Refresh tooltip is the literal "Synced recently" (view-level), not "Synced 2 h ago" from d.lastSyncedAt — ActionSpec carries no tooltip field and adding one for a single action is not worth a contract change; lastSyncedAt still feeds the timeline's sync event — costs one stale literal in a tooltip if wrong.
Task 5: minor (deferred): alert candidates joined with "; " not ", " (specs/network/detail.tsx ~901).
Task 5: minor (deferred): delinquency hint uses grouped usd() not toFixed(2) (fine, deviates from brief literal).
Task 5: minor (deferred): payout status is plain text not a badge; instrument hints raw enum ("card") uncapitalised (~502-514).
Task 5: minor (deferred): raw lowercase badge values for interaction type/direction and ticket priority; "Linkedin" via capitalise (~523, 609-616).
Task 5: minor (deferred): Relationships Network status column re-derives label with capitalise instead of networkStatusLabel; Facet column shows raw facet not the persona term (~644-650).
Task 5: minor (deferred): facetTerm switch on string with silent personCustomer fallback (~245-263); two discriminators (isOrganization vs kind) in the header (~864-874).
Task 5: minor (deferred): Verified/Not verified, Enrolled/Not enrolled, Protected/At risk, Current all render neutral tone (cells.tsx word sets).
Task 5: minor (deferred): Account types renders one comma-joined badge (contract limit: Field.value is one value).
Task 5: minor (deferred): Accounts tab money columns lack align "end" (~633-634).
Task 5: complete (commits 3e07674..4da4481, review clean)
Task 6: review (45e6005): approved, 0 Important, 5 Minor. ⚠️ resolved: live persona switch remounts DetailView via its key (persona.key is in it); check 7's "all tables empty" contact does not exist in ids 1–12 (contact-4 has invoices/payments/tickets empty, Empty copy rendered, interactions 4) — Review Focus 1 satisfied for the table segments.
Task 6: minor (deferred): list link button skips Cell's empty-value guard (list-view.tsx ~404-412).
Task 6: minor (deferred): detailRow regenerates rows every render on detail routes (index.tsx ~148).
Task 6: minor (deferred): hashFor does not encode id (routing.ts ~43).
Task 6: minor (deferred): browser Back skips the list (replace-style go; plan-mandated).
Task 6: complete (commits 4da4481..45e6005, review clean)
Controller check after Task 6 (headless, contact-1 and organization-3): 0 console errors, 6 tabs, 9/11 cards; overflowX false at 1280, TRUE at 1024 on both profiles. Cause: a long email text node in the Contact methods list card (`span.font-medium.text-sm`, right edge 1109 at vw 1024) cannot wrap; no element box exceeds the viewport.
Ruling: Task 7 also hardens the view for long unbreakable text — list-card item label/value get `min-w-0 break-all` (value column `text-end`), the header's left column gets `min-w-0` with `break-words` on the h1 and subtitle (Task 4 minor 5) — the walkthrough's overflow assertion would otherwise fail on its first run — costs a few line-wrap differences if wrong.
Task 7: minor (deferred): list-card values use `break-all`, which splits ordinary words ("Fallow|field" in Addresses at 1024); `break-words`/`[overflow-wrap:anywhere]` would only break the long email (detail-view.tsx list row). Controller re-check on c4e985a: overflowX false at 1280 and 1024, 0 console errors.
Task 7: review (c4e985a): 1 Important, 5 Minor.
Task 7: minor (deferred): `break-all` also on the list-card label (beyond the ruling); `break-words` would do for labels (detail-view.tsx ~378).
Task 7: minor (deferred): `break-words` on the flex-wrap h1 has no effect on an unbreakable title (anonymous flex item min-content); `overflow-wrap: anywhere` would (detail-view.tsx ~134).
Task 7: minor (deferred): inset context in check-recipe.mjs not closed in a finally (~280-312).
Task 7: minor (deferred): overflow expression and error-listener block duplicated in check-recipe.mjs (~88, 255, 294-310).
Task 7: minor (deferred): details `h1` field includes badge text (cosmetic, matches read()).
Task 7: fix round 1/5 (1 addressed, 0 open — details pass asserts hash id + tabs, pushes "profile not reached"; commits c4e985a..4123a59)
Task 7: complete (commits 45e6005..4123a59, review clean after 1 fix round)
Controller verification on 4123a59: playground lint clean (125 files), typecheck clean, build ok, pnpm test all passed (ui-atoms 168, icons 1, playground 14 files).
Final review: package review-ffd4ffb..4123a59.diff (10 commits), Opus high.
Final review (4123a59, Opus high): 0 Critical, 5 Important, minors triaged (must-fix: T2-2, T2-3, T7-1/T7-2; optional: T5 facet column). Verdict: with fixes. One fix wave follows.
Ruling: contacts always keep `row.accountNumber` (the 80% CONTACT_HAS_ACCOUNT draw is dropped) — spec §6.1 "reused as-is so the profile agrees with the list" outranks the §6.2 80% figure, which cannot hold without changing the list; the earlier "no billing without an account" ruling becomes moot (every party has one) — costs nothing if wrong beyond re-adding one draw.
Ruling: `lastPayment` is strictly the latest payment or null (no invented fallback) — the Account card must agree with the Payments segment (final review Important 1) — costs "None" on profiles with no payments.
Ruling: unlinked payment amounts draw from the tenant's `arShape` total range, not the borrowed G1 `payShape` amount (final review Important 4, overrides the plan's "amounts from payShape.numbers.amount") — costs nothing if wrong beyond a range swap.
Ruling: duplicate candidates' evidence agrees with their signal (email → the row's email; phone → shared phone in the description; name + address → a similar name) (final review Important 3).
Ruling: `break-all` becomes `[overflow-wrap:anywhere]` on list-card label/value and the h1 (final review must-fix minor; same goal as the Task 7 ruling, different utility).
Ruling: spec §5.1 and §10 are amended to say a persona switch re-renders the same id for the new persona (docs drift; the implementation follows the plan's Global Constraint).
Fix wave: commits 4123a59..89eebb3 (3), scoped re-review: A1–A4, B1–B3, C1–C2 all ADDRESSED, no Critical/Important breakage. Controller verification on 89eebb3: typecheck/build clean, pnpm test green (playground 105), profiles 0 overflow at 1280/1024, 1 Biome class-sort warning.
Ruling: one mechanical housekeeping commit after the fix wave (Biome class sort via lint:fix, two stale spec sentences from A2, exclude the row's first name in the name+address duplicate variant) — formatter and doc edits plus a one-line filter, verified by lint/typecheck/build/probe, not a second review wave — costs nothing if wrong.
Parked: organization `name + address` duplicate candidates are random org names, not near variants — Ruling: acceptable, the "same last name" rule only fits persons; deferred.
Parked: `"Not linked"` guard in specs/network/detail.tsx is unreachable for generated data — Ruling: keep as a guard; deferred.
Final verification on 3c73753: lint clean (no warnings), typecheck clean, build ok, pnpm test green (ui-atoms 168, icons 1, playground 105); profile walkthrough pass over both Network lists × 3 personas: 12 pages, 0 console/page errors, 0 overflow, no failures.
