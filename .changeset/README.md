# Changesets

Run `pnpm changeset` on every pull request that changes a published package: `major` for a
breaking API change, `minor` for a new component, part or prop, `patch` for a fix. Every
publish runs `scripts/content-scan.ts` first.
