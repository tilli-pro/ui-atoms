#!/usr/bin/env tsx
/**
 * Materialise the pinned coss base.
 *
 *   pnpm fetch-coss                     write .coss-base/ and verify every digest
 *   pnpm fetch-coss --check --offline   verify the committed .coss-base/ bytes against
 *                                       the lock. No network. This is the one that runs
 *                                       in the required CI job
 *   pnpm fetch-coss --check             as above, plus: the LIVE registry must still
 *                                       serve the locked digests. Upstream is actively
 *                                       developed, so this fails whenever coss moves —
 *                                       it runs on a schedule, never as a merge gate
 *   pnpm fetch-coss --update            re-pin coss-lock.json, but only after proving that
 *                                       what the registry serves IS the source at
 *                                       `COSS.revision`
 *
 * `--update` is a deliberate act: run it, read `git diff .coss-base/`, re-apply our
 * divergences where the diff touches them, and commit the lock and the base together.
 *
 * Two things the lock is load-bearing for, and therefore two things this script proves
 * rather than asserts:
 *
 *  1. The revision label. The registry endpoint serves no revision of its own, so
 *     `--update` cannot take `COSS.revision` on trust: it re-reads every served file
 *     from `apps/ui/registry/**` at that exact commit and refuses to write the lock if
 *     one byte differs or the commit cannot be read. A label nobody checked would make
 *     THIRD-PARTY-NOTICES and the manifest provenance point at a tree we do not have.
 *  2. The committed bytes. `.coss-base/` exists only as byte-identical upstream
 *     provenance (which is why biome.json exempts it), so `--check` compares the files
 *     on disk against the lock as well as the live registry against the lock. Without
 *     that, a stray edit to `.coss-base/` passes CI forever.
 *
 * Only `apps/ui/registry/**` is ever read from the coss repository, and only over
 * HTTPS — the repository is never cloned (CONTRIBUTING's AGPL tripwire).
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { COMPONENTS, COSS, COSS_LIBS } from "./manifest.js";

const ROOT = resolve(import.meta.dirname, "..", "..");
const BASE_DIR = join(ROOT, ".coss-base");
const LOCK = join(ROOT, "scripts", "coss", "coss-lock.json");

/** The one subtree of the coss repository this package is permitted to read. */
const REGISTRY_PREFIX = "registry/";

interface RegistryFile {
  path: string;
  content: string;
  type: string;
}
interface RegistryItem {
  name: string;
  files: RegistryFile[];
  dependencies?: string[];
  registryDependencies?: string[];
}
export interface LockEntry {
  registry: string;
  /** Path of the file inside the coss repository's `apps/ui/`. */
  path: string;
  /** Path the bytes are written to, relative to `.coss-base/`. */
  base: string;
  sha256: string;
  dependencies: string[];
  registryDependencies: string[];
}
export interface Lock {
  revision: string;
  revisionDate: string;
  /** Where the revision label was verified against, file by file. */
  revisionSource: string;
  fetchedAt: string;
  revisionVerifiedAt: string;
  files: Record<string, LockEntry>;
}

/** One registry file as the registry served it, before anything is written. */
export interface ServedFile {
  key: string;
  path: string;
  content: string;
}

export const sha256 = (text: string): string =>
  createHash("sha256").update(text, "utf8").digest("hex");

const today = (): string => new Date().toISOString().slice(0, 10);

const GITHUB_ORIGIN_RE = /^https?:\/\/github\.com\//;
const TRAILING_SLASH_RE = /\/$/;
const SLUG_RE = /^[\w.-]+\/[\w.-]+$/;
const EXT_RE = /\.tsx?$/;

/** `https://github.com/cosscom/coss` → `cosscom/coss`. */
export function repoSlug(repoUrl: string): string {
  const slug = repoUrl
    .replace(GITHUB_ORIGIN_RE, "")
    .replace(TRAILING_SLASH_RE, "");
  if (!SLUG_RE.test(slug))
    throw new Error(`COSS.repo is not a github.com repository URL: ${repoUrl}`);
  return slug;
}

/**
 * Raw URL of one registry file at one revision. Refuses any path outside
 * `apps/ui/registry/**`.
 */
export function rawUrl(revision: string, path: string): string {
  if (!path.startsWith(REGISTRY_PREFIX))
    throw new Error(
      `refusing to read "${path}": only apps/ui/${REGISTRY_PREFIX}** may be read from the coss repository`,
    );
  return `https://raw.githubusercontent.com/${repoSlug(COSS.repo)}/${revision}/apps/ui/${path}`;
}

/** Fetch text, or null when the resource is absent at that revision. */
export async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return await res.text();
}

/**
 * Every served file that is NOT byte-identical to the same path at `revision`.
 * An empty array means the revision label is an honest description of these bytes.
 */
export async function revisionMismatches(
  served: readonly ServedFile[],
  revision: string,
  read: (url: string) => Promise<string | null> = fetchText,
): Promise<string[]> {
  const bad: string[] = [];
  for (const file of served) {
    const url = rawUrl(revision, file.path);
    const atRevision = await read(url);
    if (atRevision === null) {
      bad.push(
        `${file.key}: ${file.path} does not exist at ${revision.slice(0, 7)}`,
      );
      continue;
    }
    if (atRevision !== file.content)
      bad.push(
        `${file.key}: the registry serves bytes that are not ${file.path} at ${revision.slice(0, 7)}`,
      );
  }
  return bad;
}

/** Every file under `dir`, as paths relative to it, in posix spelling. */
function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const abs = join(entry.parentPath, entry.name);
    out.push(relative(dir, abs).split(sep).join(posix.sep));
  }
  return out.sort();
}

/**
 * Compare the bytes committed under `.coss-base/` against the lock: the guard that
 * makes the directory's byte-identity to upstream an enforced property rather than a
 * promise. Returns one line per divergence; empty means the tree is intact.
 */
export function committedBaseFindings(lock: Lock, baseDir: string): string[] {
  const findings: string[] = [];
  const expected = new Set<string>();
  for (const [key, entry] of Object.entries(lock.files)) {
    expected.add(entry.base);
    const abs = join(baseDir, entry.base);
    if (!existsSync(abs)) {
      findings.push(
        `${entry.base}: missing from .coss-base/ (locked for ${key})`,
      );
      continue;
    }
    const digest = sha256(readFileSync(abs, "utf8"));
    if (digest !== entry.sha256)
      findings.push(
        `${entry.base}: edited since the fetch — sha256 ${digest.slice(0, 12)} ≠ lock ${entry.sha256.slice(0, 12)}`,
      );
  }
  for (const found of listFiles(baseDir))
    if (!expected.has(found))
      findings.push(`${found}: present in .coss-base/ but not in the lock`);
  return findings.sort();
}

async function fetchItem(name: string): Promise<RegistryItem> {
  const url = `${COSS.registry}/${name}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const item = (await res.json()) as RegistryItem;
  if (!Array.isArray(item.files) || item.files.length === 0)
    throw new Error(`${url} → no files[]`);
  return item;
}

/**
 * The commit `revision` names, read from the repository. Fails loudly rather than
 * letting `--update` stamp a revision nobody could resolve.
 */
export async function resolveRevision(
  revision: string,
): Promise<{ sha: string; date: string }> {
  const url = `https://api.github.com/repos/${repoSlug(COSS.repo)}/commits/${revision}`;
  const res = await fetch(url, {
    headers: { accept: "application/vnd.github+json" },
  });
  if (!res.ok)
    throw new Error(
      `cannot resolve ${revision.slice(0, 7)} at ${COSS.repo}: ${url} → HTTP ${res.status}`,
    );
  const body = (await res.json()) as {
    sha?: string;
    commit?: { committer?: { date?: string } };
  };
  const sha = body.sha;
  const date = body.commit?.committer?.date;
  if (typeof sha !== "string" || typeof date !== "string")
    throw new Error(`${url} → no sha/committer date in the response`);
  return { sha, date: date.slice(0, 10) };
}

/** Print the committed-bytes findings, if any. True when the tree is intact. */
function reportCommittedBase(lock: Lock): boolean {
  const findings = committedBaseFindings(lock, BASE_DIR);
  if (findings.length === 0) return true;
  console.error(
    ".coss-base/ no longer matches coss-lock.json — it must stay byte-identical to upstream:",
  );
  for (const line of findings) console.error(`  ${line}`);
  console.error(
    "Run `pnpm fetch-coss` to restore it, or revert whatever edited it.",
  );
  return false;
}

export async function main(): Promise<void> {
  const mode = process.argv.includes("--update")
    ? "update"
    : process.argv.includes("--check")
      ? "check"
      : "fetch";
  const offline = process.argv.includes("--offline");
  if (offline && mode !== "check")
    throw new Error("--offline is only meaningful with --check");

  // The offline half of `--check`: the lock against the bytes we committed. It is the
  // half that can fail because of something in THIS pull request, so it is the half
  // that gates merges; the live-registry half below reds every branch the moment
  // upstream edits any locked file, which is a scheduled chore, not a review finding.
  if (offline) {
    const lock = JSON.parse(readFileSync(LOCK, "utf8")) as Lock;
    if (!reportCommittedBase(lock)) process.exit(1);
    console.log(
      `coss base verified offline: ${Object.keys(lock.files).length} items at ${COSS.revision.slice(0, 7)} (${COSS.revisionDate})`,
    );
    return;
  }
  const previous: Lock | undefined =
    mode === "update"
      ? undefined
      : (JSON.parse(readFileSync(LOCK, "utf8")) as Lock);
  const files: Record<string, LockEntry> = {};
  const served: ServedFile[] = [];
  const drift: string[] = [];
  /** Held back in `--update` so a run that fails verification leaves no bytes behind. */
  const writes: { abs: string; content: string }[] = [];
  const flush = (): void => {
    for (const { abs, content } of writes.splice(0)) {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
  };

  const record = (
    key: string,
    base: string,
    registry: string,
    item: RegistryItem,
    file: RegistryFile,
    label: string,
  ): void => {
    const digest = sha256(file.content);
    files[key] = {
      registry,
      path: file.path,
      base,
      sha256: digest,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
    };
    served.push({ key, path: file.path, content: file.content });
    if (previous !== undefined && previous.files[key]?.sha256 !== digest)
      drift.push(`${key} (${registry}) — ${label}`);
    if (mode !== "check")
      writes.push({ abs: join(BASE_DIR, base), content: file.content });
  };

  for (const component of COMPONENTS) {
    const registry =
      component.registry ??
      (component.source === "coss" ? component.name : undefined);
    if (registry === undefined) continue;
    const item = await fetchItem(registry);
    const file =
      item.files.find((f) => f.type === "registry:ui") ?? item.files[0];
    if (file === undefined)
      throw new Error(`${registry}: registry item has no usable file`);
    record(
      component.name,
      `${component.name}.tsx`,
      registry,
      item,
      file,
      component.disposition,
    );
  }

  for (const lib of COSS_LIBS) {
    const item = await fetchItem(lib.registry);
    const file =
      item.files.find((f) => f.type === "registry:lib") ?? item.files[0];
    if (file === undefined)
      throw new Error(`${lib.registry}: registry item has no usable file`);
    const key = lib.base.replace(EXT_RE, ""); // "lib/segmented-control"
    record(key, lib.base, lib.registry, item, file, "vendored lib");
  }

  const count = Object.keys(files).length;
  if (mode === "fetch") flush();

  if (mode === "update") {
    const { sha, date } = await resolveRevision(COSS.revision);
    if (sha !== COSS.revision)
      throw new Error(
        `${COSS.repo} resolved ${COSS.revision} to ${sha} — re-pin manifest.ts first`,
      );
    if (date !== COSS.revisionDate) {
      console.error(
        `COSS.revisionDate says ${COSS.revisionDate}, but ${sha.slice(0, 7)} was committed ${date}.`,
      );
      console.error("Fix manifest.ts before re-pinning the lock.");
      process.exit(1);
    }
    const mismatched = await revisionMismatches(served, COSS.revision);
    if (mismatched.length > 0) {
      console.error(
        `the registry is not serving ${sha.slice(0, 7)} (${date}) — refusing to write a mislabelled lock:`,
      );
      for (const line of mismatched) console.error(`  ${line}`);
      console.error(
        "coss has moved on. Resolve the revision the registry now serves, set COSS.revision / COSS.revisionDate to it, then --update again.",
      );
      process.exit(1);
    }
    flush();
    const lock: Lock = {
      revision: sha,
      revisionDate: date,
      revisionSource: `${COSS.repo}/tree/${sha}/apps/ui/${REGISTRY_PREFIX}`,
      fetchedAt: today(),
      revisionVerifiedAt: today(),
      files,
    };
    writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
    console.log(
      `coss-lock.json re-pinned: ${count} items at ${sha.slice(0, 7)} (${date}), every file verified against ${lock.revisionSource}`,
    );
    return;
  }

  if (drift.length > 0) {
    console.error(
      `coss registry moved since ${COSS.revision.slice(0, 7)} (${COSS.revisionDate}):`,
    );
    for (const line of drift) console.error(`  ${line}`);
    console.error(
      "That list is the refresh diff. Review it, re-apply our divergences, then --update in its own commit.",
    );
    process.exit(1);
  }

  if (
    mode === "check" &&
    previous !== undefined &&
    !reportCommittedBase(previous)
  )
    process.exit(1);

  console.log(
    `coss base ${mode === "check" ? "verified" : "written"}: ${count} items at ${COSS.revision.slice(0, 7)} (${COSS.revisionDate})`,
  );
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(import.meta.dirname, "fetch-coss.ts");
if (invokedDirectly) await main();
