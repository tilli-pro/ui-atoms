import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Where each half of `fetch-coss --check` runs.
 *
 * The offline half (committed `.coss-base/` bytes vs. the lock) can only fail because
 * of the branch under review, so it gates merges. The live half fails whenever coss
 * edits one of the 55 locked files — an event nobody's pull request caused and nobody's
 * pull request can fix without a full refresh — so it runs on a schedule instead. Put
 * the live check back in the required job and every open branch goes red the next time
 * upstream lands a commit.
 */
const read = (path: string) =>
  readFileSync(resolve(import.meta.dirname, "..", "..", path), "utf8");

const ONLINE_CHECK_RE = /fetch-coss --check(?! --offline)/;
const SCHEDULE_RE = /^ {2}schedule:$/m;
const DISPATCH_RE = /^ {2}workflow_dispatch:$/m;
const PULL_REQUEST_RE = /^ {2}pull_request:$/m;
const LIVE_CHECK_RE = /pnpm fetch-coss --check\s*$/m;

const ci = read(".github/workflows/ci.yml");
const drift = read(".github/workflows/coss-drift.yml");

describe("the coss checks", () => {
  it("keeps only the offline check in the required CI job", () => {
    expect(ci).toContain("pnpm fetch-coss --check --offline");
    expect(ci).not.toMatch(ONLINE_CHECK_RE);
  });

  it("runs the live-registry check on a schedule, not on pull requests", () => {
    expect(drift).toMatch(SCHEDULE_RE);
    expect(drift).toMatch(DISPATCH_RE);
    expect(drift).not.toMatch(PULL_REQUEST_RE);
    expect(drift).toMatch(LIVE_CHECK_RE);
  });
});
