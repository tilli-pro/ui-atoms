# Fix wave after the final whole-branch review (recipe 1.3.0 profiles)

Repo /Users/g1n/tilli/ui-atoms, branch feat/version-1.1.0, head 4123a59. One commit per group is fine (three commits: generator, view+spec, walkthrough+docs), or one commit for all. Commit messages are conventional, no attribution trailer, subject ≤ 100 chars.

## A. Generator (`apps/playground/src/recipes/enterprise-ui-ux/mock/network/detail.ts`, `detail-related.ts`, `mock/shapes/party-detail.ts`)

A1 (Important) "Last payment" contradicts the Payments tab: `detail.ts:~327-333` gates `lastPayment` on `(balance > 0 || paid invoice) && rng.bool(0.7)` and invents a fallback when there are no payments. Probe over 300 profiles: 89 show "None" while Payments lists rows; 21 show an invented payment while Payments is empty. Fix: `lastPayment = latest ? { amount: latest.amount, at: latest.date } : null`, where `latest` is the payment with the greatest `date`. No gate, no invented values.

A2 (Important) 21% of contact profiles say "Not linked" / $0 for a row the list shows with an account number (and often a balance): `detail.ts:~300` `hasAccount = org ? true : rng.bool(CONTACT_HAS_ACCOUNT_RATE)`. Every list row has `accountNumber`. Controller ruling: contacts always keep `row.accountNumber`; drop the draw and the now-unused `CONTACT_HAS_ACCOUNT_RATE` constant (and its shape comment), keep `TWO_ACCOUNTS_RATE`. The "no invoices/payments without an account" branch becomes unreachable: remove it rather than leave dead code.

A3 (Important) The duplicate alert says "Matched on email" beside a different email: `detail.ts:~416` builds the candidate email as `emailFor(personName(rng), name)`. Fix so the evidence agrees with the signal: `email` → the candidate's email is `d.row.email`; `phone` → the candidate keeps its own email and the description mentions the shared phone (`row.phone`); `name + address` → the candidate's name is a near variant of the row's name (same last name, different first name from the pool) with its own email. Keep the signal draw and confidence as they are.

A4 (Important) Utilities payments are ~100× the invoices: `detail-related.ts:~77,86` draw unlinked payment amounts from the borrowed G1 `payShape.amount` (median ~$55.8k) while utilities invoices are ≤ ~$1.2k. Controller ruling: unlinked payments draw from the tenant's `arShape` total range (`total_<tenant>` for `tenantOf(arShape, persona.key)`), the same range as the invoices. Linked payments stay ≤ their invoice total.

Verification for A: extend the scratch probe (`/private/tmp/claude-501/-Users-g1n-tilli-ui-atoms/bdfc846c-5b43-4743-be49-a5e3f551165c/scratchpad/profile-probe.mts`, or write `fix-wave-probe.mts` beside it) to run all 48 contacts and 52 organizations per persona and assert: determinism; no `lastPayment` when `payments.length === 0`; `lastPayment.at` equals the max payment date when payments exist; no contact with `account.numbers.length === 0`; every duplicate with signal `email` has `email === row.email`; utilities max payment amount ≤ the utilities `arShape` max total; no timeline event after ANCHOR. Paste the probe output in the report.

## B. View and spec (`views/detail-view.tsx`, `specs/network/detail.tsx`)

B1 (must-fix minor) `break-all` on the list-card label (`detail-view.tsx:~377`) and value (`~387`) splits ordinary words at 1024 ("Fallow|field" in Addresses); `break-words` on the h1 (`~134`) is inert because the h1 is a flex container. Replace all three with the Tailwind arbitrary class `[overflow-wrap:anywhere]` (keep `min-w-0` where it is). Confirm with a headless screenshot or a text-node scan that the long email still wraps and no element or text node exceeds the viewport at 1024 on `#/network/contacts/contact-1`.

B2 (low-cost) Relationships › Facet column shows the raw facet (`specs/network/detail.tsx:~473`); use the same persona-term mapping the header badge uses (`orgFacetTerm`).

B3 (low-cost) Alert action buttons force `variant="outline"` (`detail-view.tsx:~226`); use `action.variant ?? "outline"` so the spec's `ghost` on "They're different" applies.

## C. Walkthrough and docs

C1 (Important) `docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs` `--details` pass: push a failure `${persona} ${route}: profile shape (crumbs N, cells N, tabs N)` when `crumbs.length !== 3 || summaryCells !== 6 || tabs.length !== 6`; then click the second breadcrumb link (`main nav li a` index 1, or `main nav a` index 1) and assert `location.hash` equals the list hash (`#/network/contacts` or `#/network/organizations`), pushing `${persona} ${route}: breadcrumb did not return to the list` otherwise. Keep regexes Biome-safe. Re-run `node docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs http://localhost:5173 utilities,financial,government_federal "$(paste -sd, docs/superpowers/plans/2026-11-10-enterprise-mocks-run/routes.txt)" --interact --details` and paste the SUMMARY (expect pages 126, 0/0/0, failures []).

C2 (docs) Amend `docs/superpowers/specs/2026-11-12-party-detail-design.md` §5.1 (the bullet about persona switching) and §10 (the manual check) to say: a persona switch on an open profile keeps the id (ids are index-based and identical across personas) and re-renders the profile for the new persona's row; the list fallback applies only to an unknown id. Add one line to the run ledger section "1.3.0 profiles" naming this fix wave's commits.

## Final verification (all of it, on the last commit)
`export PATH=$HOME/.nvm/versions/node/v22.22.2/bin:$PATH; pnpm lint:fix && pnpm --filter playground lint && pnpm --filter playground typecheck && pnpm --filter playground build && pnpm test` — all clean — plus the walkthrough run from C1.
