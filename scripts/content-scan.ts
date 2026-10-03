#!/usr/bin/env tsx
/**
 * Forbidden-content scan: customer-owned content, tenant machinery,
 * fonts, internal hostnames and env files must never enter this repository or a
 * published tarball. Runs in CI on every PR and in `prepublishOnly`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export interface Finding {
  path: string;
  line?: number;
  rule: string;
  level: "fail" | "warn";
}

export interface Term {
  rule: string;
  re: RegExp;
}

export const FORBIDDEN_TERMS: readonly Term[] = [
  {
    rule: "term:internal-hostname",
    re: /\b[a-z0-9.-]*\.(tillisoftware\.com|tilli\.pro|utilli\.com|tillix\.app|amazonaws\.com|cloudfront\.net)\b/i,
  },
  {
    rule: "term:tenant-package",
    re: /@tillix\/tenants|@tilli-internal\/tenant-data/,
  },
  {
    rule: "term:tenant-selector",
    re: /\[data-tenant|data-tenant-variant|useTenant\(|TenantProvider/,
  },
  { rule: "term:i18n", re: /react-i18next|\bi18next\b|useTranslation\(/ },
];

export const FORBIDDEN_FILES: readonly { rule: string; re: RegExp }[] = [
  { rule: "file:font", re: /\.(woff2?|ttf|otf|eot)$/i },
  { rule: "file:tenant-styles", re: /styles\/tenants\//i },
  { rule: "file:sst-env", re: /(^|\/)sst-env\.d\.ts$/ },
  { rule: "file:dotenv", re: /(^|\/)\.env(\.(?!example$)[^/]+)?$/ },
  { rule: "file:preport-baselines", re: /^apps\/storybook\/visual\/preport\// },
];

/**
 * TRIPWIRE, NOT A SANCTIONED LOCATION. Planning documents are kept outside this repository, so
 * `docs/superpowers/` must never exist here. The rule reports an accidental copy on every run
 * instead of letting it pass as an unscanned path, and `--strict` makes it blocking.
 */
export const WARN_ONLY_PATHS: readonly RegExp[] = [/^docs\/superpowers\//];
// The scanner and its test carry the generic rules' own literals. `scripts/private/` and
// `__tests__/private/` exist only in a checkout that keeps extra terms: they hold the terms and
// their fixtures, so they are never scanned against them.
const IGNORED_PATHS: readonly RegExp[] = [
  /^scripts\/content-scan\.ts$/,
  /^__tests__\/content-scan\.test\.ts$/,
  /^scripts\/private\//,
  /^__tests__\/private\//,
  /^pnpm-lock\.yaml$/,
  /^THIRD-PARTY-NOTICES\.md$/,
];

export const DEFAULT_TERMS_FILE = "scripts/private/content-scan-terms.json";

const GENERIC_RULES = new Set(FORBIDDEN_TERMS.map((t) => t.rule));

/**
 * Parses a supplied term list: `{"terms": [{ rule, pattern, flags? }]}`. A malformed list throws
 * rather than scanning with fewer terms than the owner gave. `g` and `y` are rejected because
 * they make `RegExp.test` stateful across lines.
 */
export function parseTerms(json: string): Term[] {
  const bad = new Error('content-scan: terms file must be {"terms": [...]}');
  let doc: unknown;
  try {
    doc = JSON.parse(json);
  } catch {
    throw bad;
  }
  const list = (doc as { terms?: unknown } | null)?.terms;
  if (typeof doc !== "object" || doc === null || !Array.isArray(list))
    throw bad;
  if (list.length === 0) throw new Error("content-scan: no terms");
  const seen = new Set<string>();
  return list.map((entry: unknown, i) => {
    const { rule, pattern, flags } = (entry ?? {}) as Record<string, unknown>;
    if (typeof rule !== "string" || !/^term:[a-z0-9-]+$/.test(rule))
      throw new Error(
        `content-scan: term ${i}: rule must match term:[a-z0-9-]+`,
      );
    if (GENERIC_RULES.has(rule))
      throw new Error(`content-scan: ${rule} is a generic rule`);
    if (seen.has(rule)) throw new Error(`content-scan: duplicate rule ${rule}`);
    seen.add(rule);
    if (typeof pattern !== "string" || pattern === "")
      throw new Error(
        `content-scan: ${rule}: pattern must be a non-empty string`,
      );
    if (
      flags !== undefined &&
      (typeof flags !== "string" ||
        !/^[imsu]*$/.test(flags) ||
        new Set(flags).size !== flags.length)
    )
      throw new Error(
        `content-scan: ${rule}: flags must be unique characters of "imsu"`,
      );
    try {
      return {
        rule,
        re: new RegExp(pattern, (flags as string | undefined) ?? ""),
      };
    } catch (e) {
      throw new Error(`content-scan: ${rule}: ${(e as Error).message}`);
    }
  });
}

/**
 * The extra terms for a scan: the `explicit` file when named (resolved against the working
 * directory), else `DEFAULT_TERMS_FILE` under `root` when it exists, else none.
 */
export function loadTerms(
  root: string,
  explicit?: string,
): { terms: Term[]; source: string | null } {
  if (explicit !== undefined) {
    const abs = isAbsolute(explicit)
      ? explicit
      : resolve(process.cwd(), explicit);
    if (!existsSync(abs))
      throw new Error(`content-scan: terms file ${explicit} not found`);
    return { terms: parseTerms(readFileSync(abs, "utf8")), source: explicit };
  }
  const abs = join(root, DEFAULT_TERMS_FILE);
  if (!existsSync(abs)) return { terms: [], source: null };
  return {
    terms: parseTerms(readFileSync(abs, "utf8")),
    source: DEFAULT_TERMS_FILE,
  };
}

export function scanFiles(
  files: readonly { path: string; text?: string }[],
  extra: readonly Term[] = [],
): Finding[] {
  const out: Finding[] = [];
  const terms = [...FORBIDDEN_TERMS, ...extra];
  for (const f of files) {
    if (IGNORED_PATHS.some((re) => re.test(f.path))) continue;
    const level: Finding["level"] = WARN_ONLY_PATHS.some((re) =>
      re.test(f.path),
    )
      ? "warn"
      : "fail";
    for (const rule of FORBIDDEN_FILES) {
      if (rule.re.test(f.path))
        out.push({ path: f.path, rule: rule.rule, level });
    }
    if (f.text === undefined) continue;
    const lines = f.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const rule of terms) {
        if (rule.re.test(lines[i] ?? ""))
          out.push({ path: f.path, line: i + 1, rule: rule.rule, level });
      }
    }
  }
  return out;
}

const TEXT_RE = /\.(ts|tsx|js|mjs|cjs|json|md|mdx|css|yml|yaml|html|txt)$/i;

function trackedFiles(root: string): string[] {
  const tracked = execFileSync("git", ["-C", root, "ls-files", "-z"], {
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const dist = join(root, "packages", "ui-atoms", "dist");
  const extra = existsSync(dist)
    ? execFileSync("find", [dist, "-type", "f"], { encoding: "utf8" })
        .split("\n")
        .filter(Boolean)
        .map((p) => p.slice(root.length + 1))
    : [];
  return [...tracked, ...extra];
}

/**
 * The CLI's file list: everything git tracks under `root`, plus the built `dist` (which is
 * git-ignored but is exactly what `prepublishOnly` puts in the tarball). Text is read for known
 * text extensions under 2 MB; everything else is path-scanned only. Exported so the CLI's
 * behaviour is testable against a scratch repository instead of only by planting files here.
 */
export function collectFiles(root: string): { path: string; text?: string }[] {
  return trackedFiles(root).map((path) => {
    const abs = join(root, path);
    const text =
      TEXT_RE.test(path) && statSync(abs).size < 2_000_000
        ? readFileSync(abs, "utf8")
        : undefined;
    return { path, text };
  });
}

/** What makes the CLI exit 1: every `fail`, plus every `warn` under `--strict`. */
export function blockingFindings(
  findings: readonly Finding[],
  strict: boolean,
): Finding[] {
  return findings.filter(
    (f) => f.level === "fail" || (strict && f.level === "warn"),
  );
}

export function parseArgs(argv: readonly string[]): {
  strict: boolean;
  root: string | null;
  terms: string | null;
} {
  const out = {
    strict: false,
    root: null as string | null,
    terms: null as string | null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--strict") out.strict = true;
    else if (arg === "--root" || arg === "--terms") {
      const value = argv[++i];
      if (value === undefined)
        throw new Error(`content-scan: ${arg} needs a value`);
      if (arg === "--root") out.root = value;
      else out.terms = value;
    } else throw new Error(`content-scan: unknown argument ${arg}`);
  }
  return out;
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const root = args.root
    ? resolve(args.root)
    : resolve(import.meta.dirname, "..");
  const { terms, source } = loadTerms(root, args.terms ?? undefined);
  console.log(
    source
      ? `content-scan: extra terms: ${terms.length} from ${source}`
      : "content-scan: no extra terms supplied, generic rules only",
  );
  const files = collectFiles(root);
  const findings = scanFiles(files, terms);
  for (const f of findings)
    console.log(
      `${f.level.toUpperCase()} ${f.path}${f.line ? `:${f.line}` : ""} ${f.rule}`,
    );
  const fails = blockingFindings(findings, args.strict);
  console.log(
    `content-scan: ${files.length} files, ${findings.length} finding(s), ${fails.length} blocking${args.strict ? " (strict)" : ""}`,
  );
  if (fails.length > 0) process.exit(1);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(import.meta.filename)
)
  main();
