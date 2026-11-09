#!/usr/bin/env tsx
/**
 * Materialise the pinned shadcn/ui base.
 *
 *   pnpm fetch-shadcn                     write .shadcn-base/ and report drift against the lock
 *   pnpm fetch-shadcn --check --offline   verify the committed .shadcn-base/ bytes against the
 *                                         lock. No network. This is the one that runs in the
 *                                         required CI job
 *   pnpm fetch-shadcn --check             as above, plus: the LIVE registry must still serve
 *                                         the locked digests. shadcn moves often, so this runs
 *                                         on a schedule, never as a merge gate
 *   pnpm fetch-shadcn --update            re-pin shadcn-lock.json to what the registry serves
 *                                         now, and record where each template stands
 *
 * `--update` is a deliberate act: run it, read `git diff .shadcn-base/`, re-apply our
 * divergences where the diff touches them, and commit the lock and the base together.
 *
 * What this lock proves, compared with `scripts/coss/fetch-coss.ts`:
 *
 *  1. The committed bytes — exactly. `.shadcn-base/` exists only as byte-identical registry
 *     provenance (biome.json exempts it), and `--check` compares the files on disk against
 *     the lock, so a stray edit cannot pass CI.
 *  2. The revision — provenance only. The shadcn registry serves GENERATED files: a style
 *     (`base-nova`) is built from a template under `apps/v4/registry/bases/<base>/ui/` whose
 *     class lists are `cn-*` placeholders, so no commit of shadcn-ui/ui holds the served
 *     bytes verbatim and there is nothing to verify byte-for-byte. `--update` records the
 *     last commit that touched each template and confirms the template exists at it; that
 *     says "what the template looked like when we fetched", not "these bytes live at this
 *     commit". THIRD-PARTY-NOTICES quotes the digest, not a revision, for that reason.
 *
 * Only `apps/v4/registry/**` is ever read from the shadcn repository, and only over HTTPS.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  committedBaseFindings,
  fetchText,
  repoSlug,
  sha256,
} from "../coss/fetch-coss.js";
import { SHADCN, SHADCN_COMPONENTS } from "./manifest.js";

const ROOT = resolve(import.meta.dirname, "..", "..");
const BASE_DIR = join(ROOT, ".shadcn-base");
const BASE_LABEL = ".shadcn-base";
const LOCK = join(ROOT, "scripts", "shadcn", "shadcn-lock.json");

/** The one subtree of the shadcn repository this package is permitted to read. */
const TEMPLATE_PREFIX = "registry/";

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

export interface ShadcnLockEntry {
  registry: string;
  /** Path the registry reports for the served file (`registry/<style>/ui/<name>.tsx`). */
  path: string;
  /** Path the bytes are written to, relative to `.shadcn-base/`. */
  base: string;
  /** Digest of the served bytes — the exact half of the pin. */
  sha256: string;
  dependencies: string[];
  registryDependencies: string[];
  /** The template the bytes were generated from — provenance, not a byte pin. */
  template: {
    /** Relative to `apps/v4/` in the shadcn repository. */
    path: string;
    /** Last commit that touched the template when the bytes were fetched. */
    revision: string;
    revisionDate: string;
  };
}
export interface ShadcnLock {
  style: string;
  registry: string;
  repo: string;
  fetchedAt: string;
  files: Record<string, ShadcnLockEntry>;
}

export interface ServedFile {
  key: string;
  path: string;
  content: string;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/** `accept` plus a token when the environment has one; the API allows 60/h without. */
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Raw URL of one template at one revision. Refuses any path outside
 * `apps/v4/registry/**`.
 */
export function templateUrl(revision: string, path: string): string {
  if (!path.startsWith(TEMPLATE_PREFIX))
    throw new Error(
      `refusing to read "${path}": only apps/v4/${TEMPLATE_PREFIX}** may be read from the shadcn repository`,
    );
  return `https://raw.githubusercontent.com/${repoSlug(SHADCN.repo)}/${revision}/apps/v4/${path}`;
}

/**
 * The last commit on `SHADCN.branch` that touched `apps/v4/<path>`, verified to still hold
 * the template. Fails loudly rather than stamping a revision nobody could resolve.
 */
export async function latestTemplateCommit(
  path: string,
  read: (url: string) => Promise<string | null> = fetchText,
): Promise<{ sha: string; date: string }> {
  const url = `https://api.github.com/repos/${repoSlug(SHADCN.repo)}/commits?path=${encodeURIComponent(`apps/v4/${path}`)}&sha=${SHADCN.branch}&per_page=1`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const body = (await res.json()) as {
    sha?: string;
    commit?: { committer?: { date?: string } };
  }[];
  const head = body[0];
  const sha = head?.sha;
  const date = head?.commit?.committer?.date;
  if (typeof sha !== "string" || typeof date !== "string")
    throw new Error(
      `apps/v4/${path}: no commit on ${SHADCN.branch} of ${SHADCN.repo} touches it`,
    );
  if ((await read(templateUrl(sha, path))) === null)
    throw new Error(
      `apps/v4/${path} does not exist at ${sha.slice(0, 7)} — the template moved; fix manifest.ts`,
    );
  return { sha, date: date.slice(0, 10) };
}

async function fetchItem(name: string): Promise<RegistryItem> {
  const url = `${SHADCN.registry}/${name}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const item = (await res.json()) as RegistryItem;
  if (!Array.isArray(item.files) || item.files.length === 0)
    throw new Error(`${url} → no files[]`);
  return item;
}

const readLock = (): ShadcnLock =>
  JSON.parse(readFileSync(LOCK, "utf8")) as ShadcnLock;

/** Print the committed-bytes findings, if any. True when the tree is intact. */
function reportCommittedBase(lock: ShadcnLock): boolean {
  const findings = committedBaseFindings(lock, BASE_DIR, BASE_LABEL);
  if (findings.length === 0) return true;
  console.error(
    `${BASE_LABEL}/ no longer matches shadcn-lock.json — it must stay byte-identical to the registry:`,
  );
  for (const line of findings) console.error(`  ${line}`);
  console.error(
    "Run `pnpm fetch-shadcn` to restore it, or revert whatever edited it.",
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

  if (offline) {
    const lock = readLock();
    if (!reportCommittedBase(lock)) process.exit(1);
    console.log(
      `shadcn base verified offline: ${Object.keys(lock.files).length} items, style ${lock.style}, fetched ${lock.fetchedAt}`,
    );
    return;
  }

  const previous: ShadcnLock | undefined =
    mode === "update" ? undefined : readLock();
  const files: Record<string, ShadcnLockEntry> = {};
  const drift: string[] = [];
  /** Held back in `--update` so a run that fails provenance leaves no bytes behind. */
  const writes: { abs: string; content: string }[] = [];
  const flush = (): void => {
    for (const { abs, content } of writes.splice(0)) {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
  };

  for (const component of SHADCN_COMPONENTS) {
    const item = await fetchItem(component.registry);
    const file =
      item.files.find((f) => f.type === "registry:ui") ?? item.files[0];
    if (file === undefined)
      throw new Error(
        `${component.registry}: registry item has no usable file`,
      );
    const digest = sha256(file.content);
    const base = `${component.name}.tsx`;
    const template =
      mode === "update"
        ? await (async () => {
            const { sha, date } = await latestTemplateCommit(
              component.template,
            );
            return {
              path: component.template,
              revision: sha,
              revisionDate: date,
            };
          })()
        : (previous?.files[component.name]?.template ?? {
            path: component.template,
            revision: "",
            revisionDate: "",
          });
    files[component.name] = {
      registry: component.registry,
      path: file.path,
      base,
      sha256: digest,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      template,
    };
    if (
      previous !== undefined &&
      previous.files[component.name]?.sha256 !== digest
    )
      drift.push(
        `${component.name} (${component.registry}) — ${component.disposition}`,
      );
    if (mode !== "check")
      writes.push({ abs: join(BASE_DIR, base), content: file.content });
  }

  const count = Object.keys(files).length;
  if (mode === "fetch") flush();

  if (mode === "update") {
    flush();
    const lock: ShadcnLock = {
      style: SHADCN.style,
      registry: SHADCN.registry,
      repo: SHADCN.repo,
      fetchedAt: today(),
      files,
    };
    writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
    console.log(
      `shadcn-lock.json re-pinned: ${count} items from ${SHADCN.registry}, served bytes digest-pinned, template provenance recorded`,
    );
    return;
  }

  if (drift.length > 0) {
    console.error(
      `shadcn registry moved since the lock was written (${previous?.fetchedAt}):`,
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
    `shadcn base ${mode === "check" ? "verified" : "written"}: ${count} items, style ${SHADCN.style}`,
  );
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(import.meta.dirname, "fetch-shadcn.ts");
if (invokedDirectly) await main();
