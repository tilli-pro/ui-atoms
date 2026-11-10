# Enterprise mocks run record

- `ledger.md`: the subagent-driven run ledger (every ruling, parked item and deferred minor, per task).
- `fix-wave-brief.md`: the single fix wave after the whole-branch review.
- `check-recipe.mjs`: headless Playwright walkthrough used for verification. Run from the repo root with Node 22.22.2 against a dev server: `node docs/superpowers/plans/2026-11-10-enterprise-mocks-run/check-recipe.mjs http://localhost:5173 utilities,financial,government_federal "#/finance,#/finance/receivables" --interact`. It resolves Playwright from apps/storybook.
