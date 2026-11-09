# Contributing

## Licensing tripwire (read before copying any code in)

`@tilli.dev/ui-atoms` is MIT. Components originate from the **coss ui registry**
(`apps/ui/` of github.com/cosscom/ui, formerly github.com/cosscom/coss — MIT per that repo's
README/LICENSING.md at the pinned revision; `main` has since moved the components to
`packages/ui/src/components/` under a root MIT license).
The coss monorepo root is **AGPL-3.0**; only `apps/ui/` (the registry) and `apps/origin/`
are MIT. NOTHING from any other monorepo path may be copied into this repository, and
`apps/origin/` is not used here either.

Rules:
1. Only copy from `apps/ui/registry/**` (the registry) or from the coss registry JSON
   (`https://coss.com/ui/r/{name}.json`). The one other permitted source is the shadcn/ui
   registry (`https://ui.shadcn.com/r/styles/base-nova/{name}.json`, MIT), for components
   that were never coss components — pinned under `.shadcn-base/`, see below. Record the
   source path in the PR body.
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

Items the registry added after the pin (`postPin` in `manifest.ts`: today `composer` and
its libs/hook, and the multi-file `chat` kit, locked one entry per served file) cannot be verified against a commit — the registry rewrites import paths —
so their digest is the pin and the lock records `provenance` (source path, last commit)
for them. The coss repository is `github.com/cosscom/ui` (renamed from `cosscom/coss`
with history intact); `main` keeps the sources under `packages/ui/src/`.

## The shadcn base (`scripts/shadcn/`, `.shadcn-base/`)

Components with no coss counterpart (none today; the sidebar lived here for a day in 2026-11
before coss's own was chosen) can be sourced from the shadcn/ui registry, style `base-nova`,
and pinned the same way: `scripts/shadcn/manifest.ts` lists
them, `shadcn-lock.json` records a SHA-256 per served file, and `.shadcn-base/` holds those
exact bytes. In the coss manifest they carry `source: "shadcn"` and no coss `registry`, so
`fetch-coss` never writes a `.coss-base/` file for them.

    pnpm fetch-shadcn --check --offline   the committed .shadcn-base/ bytes vs. the lock.
                                          No network; runs in the required CI job.
    pnpm fetch-shadcn --check             also asks the live registry; scheduled, never a
                                          merge gate (coss-drift.yml).
    pnpm fetch-shadcn --update            re-pin, in its own commit.

One difference from coss: shadcn serves *generated* files (a style is built from a
`cn-*`-placeholder template plus the style's tokens), so no commit of shadcn-ui/ui holds
the served bytes and the lock cannot verify them against the repository. The digest of the
served bytes is the pin; the template's last commit is recorded as provenance only.

## Workflow

Branch from `main`, conventional commits (`feat(button): …`), `pnpm lint:fix` before
committing, PR with CI green. `pnpm install` installs the lefthook git hooks
(`lefthook.yml`): commit-msg runs commitlint, pre-commit formats staged files with Biome,
pre-push runs typecheck and tests. Unit tests live in the `__tests__/` folder at the root
of the package they cover, mirroring its `src/` tree — never next to the source file.
Visual changes include the updated Linux baselines from CI (see
apps/storybook/visual/README.md).
