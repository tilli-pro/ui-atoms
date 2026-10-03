#!/usr/bin/env tsx
/**
 * Publish guard for provisional subpaths.
 *
 *   pnpm check-provisional   exit 1 while `PROVISIONAL` in gen-exports.ts is non-empty
 *
 * The `release` script runs this before `changeset publish`, so the version PR can be
 * merged, tagged and reviewed as usual and only the irreversible step — the publish
 * itself — is blocked. A subpath listed there is one that must not ship until
 * an owner decision lands; npm keeps whatever we publish forever, so the guard is a
 * failing command rather than a note in a checklist.
 */
import { resolve } from "node:path";
import { PROVISIONAL } from "./gen-exports.js";

/** The failure message, or null when publishing is allowed. */
export function provisionalBlock(names: readonly string[]): string | null {
  if (names.length === 0) return null;
  return [
    `refusing to publish: ${names.length} subpath${names.length === 1 ? "" : "s"} still provisional`,
    ...names.map((name) => `  ./${name}`),
    "Each is in the exports map but has no owner decision. Answer it (and empty",
    "PROVISIONAL in scripts/gen-exports.ts), or delete the component, then publish.",
  ].join("\n");
}

function main(): void {
  const blocked = provisionalBlock(PROVISIONAL);
  if (blocked !== null) {
    console.error(blocked);
    process.exit(1);
  }
  console.log("check-provisional: no provisional subpaths — safe to publish");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(import.meta.filename)
)
  main();
