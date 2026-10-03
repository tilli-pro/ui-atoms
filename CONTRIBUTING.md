# Contributing

## Licensing tripwire (read before copying any code in)

`@tilli.dev/ui-atoms` is MIT. Components originate from the **coss ui registry**
(`apps/ui/` of github.com/cosscom/coss — MIT per that repo's README/LICENSING.md).
The coss monorepo root is **AGPL-3.0**; only `apps/ui/` (the registry) and `apps/origin/`
are MIT. NOTHING from any other monorepo path may be copied into this repository, and
`apps/origin/` is not used here either.

Rules:
1. Only copy from `apps/ui/registry/**` (the registry) or from the shadcn/coss registry
   JSON (`https://coss.com/ui/r/{name}.json`). Record the source path in the PR body.
2. Preserve upstream notices: additions to THIRD-PARTY-NOTICES.md ship in the same PR.
3. No customer content, tenant tokens, fonts, internal hostnames or env files: the CI content
   scan (`pnpm content-scan`) fails the PR. Do not add exclusions to pass it. The only standing
   exclusions are the scanner and its own test, the lockfile, THIRD-PARTY-NOTICES.md, and a
   `scripts/private/` term file with its tests where a checkout keeps one
   (`pnpm content-scan --terms <file>` supplies terms from anywhere else). The permanent coss
   tooling in `scripts/coss/` is **not** excluded and must stay clean.
4. Optional peers stay optional: a new third-party runtime dependency needs a subpath
   and a `peerDependenciesMeta` entry, never an unconditional `dependencies` entry.
5. Every component change carries a changeset.

## The coss base (`scripts/coss/`, `.coss-base/`)

`scripts/coss/` is permanent tooling and outlives the port: `manifest.ts` pins the coss
revision and the per-component dispositions, `coss-lock.json` records a SHA-256 per
fetched file, and `.coss-base/` holds those exact bytes as provenance.

    pnpm fetch-coss --check --offline   the committed .coss-base/ bytes vs. the lock.
                                        No network; runs in the required CI job.
    pnpm fetch-coss --check             also asks the live registry. Fails whenever coss
                                        moves, so it runs on a schedule
                                        (.github/workflows/coss-drift.yml), never as a
                                        merge gate.
    pnpm fetch-coss --update            re-pin, in its own commit.

Refreshing: run `--update`, read `git diff .coss-base/`, re-apply our divergences where
the diff touches them, and commit the lock, `.coss-base/` and the component edits
together. Never hand-edit `.coss-base/` — the offline check exists to catch exactly that.

## Workflow

Branch from `main`, conventional commits (`feat(button): …`), `pnpm lint:fix` before
committing, PR with CI green. `pnpm install` installs the lefthook git hooks
(`lefthook.yml`): commit-msg runs commitlint, pre-commit formats staged files with Biome,
pre-push runs typecheck and tests. Unit tests live in the `__tests__/` folder at the root
of the package they cover, mirroring its `src/` tree — never next to the source file.
Visual changes include the updated Linux baselines from CI (see
apps/storybook/visual/README.md).
