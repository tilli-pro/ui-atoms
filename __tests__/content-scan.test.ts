import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  blockingFindings,
  collectFiles,
  DEFAULT_TERMS_FILE,
  FORBIDDEN_TERMS,
  loadTerms,
  parseArgs,
  parseTerms,
  scanFiles,
} from "../scripts/content-scan.js";

const A = "packages/ui-atoms/src/components/a/index.tsx";
const B = "packages/ui-atoms/src/components/b/index.tsx";
const EXAMPLE = JSON.stringify({
  terms: [
    { rule: "term:example-customer", pattern: "acme\\s+utilities", flags: "i" },
  ],
});

describe("content-scan: generic rules", () => {
  it("names no customer in its public source", () => {
    expect(FORBIDDEN_TERMS.map((t) => t.rule)).toEqual([
      "term:internal-hostname",
      "term:tenant-package",
      "term:tenant-selector",
      "term:i18n",
    ]);
  });

  it("flags internal hostnames, tenant machinery and i18n in text", () => {
    const findings = scanFiles([
      {
        path: A,
        text: 'const u = "https://app.tillisoftware.com";\nimport { x } from "@tillix/tenants/react";',
      },
      {
        path: B,
        text: "document.querySelector('[data-tenant=\"x\"]'); useTranslation();",
      },
    ]);
    expect(findings.map((f) => `${f.path}:${f.line}:${f.rule}`)).toEqual([
      `${A}:1:term:internal-hostname`,
      `${A}:2:term:tenant-package`,
      `${B}:1:term:tenant-selector`,
      `${B}:1:term:i18n`,
    ]);
    expect(findings.every((f) => f.level === "fail")).toBe(true);
  });

  it("flags forbidden files by path regardless of content", () => {
    const paths = [
      "packages/ui-atoms/src/styles/tenants/x/brand.woff2",
      "packages/ui-atoms/sst-env.d.ts",
      ".env.local",
      ".env.example",
      "apps/storybook/visual/preport/light/x.png",
    ];
    expect(
      scanFiles(paths.map((path) => ({ path }))).map((f) => f.rule),
    ).toEqual([
      "file:font",
      "file:tenant-styles",
      "file:sst-env",
      "file:dotenv",
      "file:preport-baselines",
    ]);
  });

  it("reports docs/superpowers at warn level (a tripwire; --strict makes it blocking)", () => {
    expect(
      scanFiles([{ path: "docs/superpowers/specs/x.md", text: "useTenant()" }]),
    ).toEqual([
      {
        path: "docs/superpowers/specs/x.md",
        line: 1,
        rule: "term:tenant-selector",
        level: "warn",
      },
    ]);
  });

  it("ignores the scanner, its test, the lockfile, the notices and any private term directory", () => {
    const paths = [
      "scripts/content-scan.ts",
      "__tests__/content-scan.test.ts",
      "pnpm-lock.yaml",
      "THIRD-PARTY-NOTICES.md",
      "scripts/private/content-scan-terms.json",
      "__tests__/private/content-scan-terms.test.ts",
    ];
    const files = paths.map((path) => ({
      path,
      text: "Acme Utilities useTenant()",
    }));
    expect(scanFiles(files, parseTerms(EXAMPLE))).toEqual([]);
  });
});

describe("content-scan: extra terms supplied from outside the public source", () => {
  it("applies supplied terms on top of the generic rules, and only when supplied", () => {
    const file = { path: A, text: "Acme  Utilities service area" };
    expect(scanFiles([file])).toEqual([]);
    expect(scanFiles([file], parseTerms(EXAMPLE))).toEqual([
      { path: A, line: 1, rule: "term:example-customer", level: "fail" },
    ]);
  });

  it("rejects a malformed term list instead of scanning with less than it was given", () => {
    const bad = (terms: unknown) => () => parseTerms(JSON.stringify({ terms }));
    expect(() => parseTerms("[]")).toThrow(/content-scan/);
    expect(bad([])).toThrow(/no terms/);
    expect(bad([{ rule: "example", pattern: "x" }])).toThrow(/rule/);
    expect(bad([{ rule: "term:i18n", pattern: "x" }])).toThrow(/generic/);
    expect(
      bad([
        { rule: "term:a", pattern: "x" },
        { rule: "term:a", pattern: "y" },
      ]),
    ).toThrow(/duplicate/);
    expect(bad([{ rule: "term:a", pattern: "" }])).toThrow(/pattern/);
    expect(bad([{ rule: "term:a", pattern: "(" }])).toThrow(/term:a/);
    for (const flags of ["g", "y", "ii", "x"])
      expect(bad([{ rule: "term:a", pattern: "x", flags }]), flags).toThrow(
        /flags/,
      );
  });

  it("loads the default file when present, an explicit file when named, and nothing otherwise", () => {
    const root = mkdtempSync(join(tmpdir(), "content-scan-terms-"));
    try {
      expect(loadTerms(root)).toEqual({ terms: [], source: null });
      mkdirSync(join(root, dirname(DEFAULT_TERMS_FILE)), { recursive: true });
      writeFileSync(join(root, DEFAULT_TERMS_FILE), EXAMPLE);
      const found = loadTerms(root);
      expect(found.source).toBe(DEFAULT_TERMS_FILE);
      expect(found.terms.map((t) => t.rule)).toEqual(["term:example-customer"]);
      const explicit = join(root, "elsewhere.json");
      writeFileSync(explicit, EXAMPLE);
      expect(loadTerms(join(root, "no-such-root"), explicit).source).toBe(
        explicit,
      );
      expect(() => loadTerms(root, join(root, "missing.json"))).toThrow(
        /missing\.json/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("parses the CLI flags", () => {
    expect(parseArgs([])).toEqual({ strict: false, root: null, terms: null });
    expect(
      parseArgs(["--strict", "--root", "/tmp/s", "--terms", "t.json"]),
    ).toEqual({ strict: true, root: "/tmp/s", terms: "t.json" });
    expect(() => parseArgs(["--root"])).toThrow(/--root/);
    expect(() => parseArgs(["--bogus"])).toThrow(/--bogus/);
  });
});

// The CLI half: what it collects (everything git tracks, plus the git-ignored `dist` that a
// publish would put in the tarball) and what makes it exit 1, against a scratch repository.
describe("content-scan CLI collection and exit decision", () => {
  let root: string;
  const write = (rel: string, text: string) => {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, text);
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), "content-scan-"));
    write("README.md", "# scratch\n\nnothing forbidden here\n");
    write("src/leak.ts", 'import { useTranslation } from "react-i18next";\n');
    write("src/customer.ts", "export const x = 'Acme Utilities';\n");
    write("docs/superpowers/specs/x.md", "TenantProvider\n");
    write("assets/brand.woff2", " binary-ish\n");
    execFileSync("git", ["-C", root, "init", "-q"]);
    execFileSync("git", ["-C", root, "add", "-A"]);
    write(
      "packages/ui-atoms/dist/components/leak.js",
      'var t = "Acme Utilities";\n',
    );
    write("packages/ui-atoms/dist/brand.woff2", " binary-ish\n");
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it("collects tracked files plus dist, and reads text only for text extensions", () => {
    const files = collectFiles(root);
    expect(files.map((f) => f.path).sort()).toEqual([
      "README.md",
      "assets/brand.woff2",
      "docs/superpowers/specs/x.md",
      "packages/ui-atoms/dist/brand.woff2",
      "packages/ui-atoms/dist/components/leak.js",
      "src/customer.ts",
      "src/leak.ts",
    ]);
    const byPath = new Map(files.map((f) => [f.path, f]));
    expect(byPath.get("README.md")?.text).toContain("nothing forbidden here");
    expect(byPath.get("assets/brand.woff2")?.text).toBeUndefined();
  });

  it("blocks on fail, on warn only under --strict, and on supplied terms only when supplied", () => {
    const generic = scanFiles(collectFiles(root));
    expect(generic.map((f) => `${f.level}:${f.path}:${f.rule}`).sort()).toEqual(
      [
        "fail:assets/brand.woff2:file:font",
        "fail:packages/ui-atoms/dist/brand.woff2:file:font",
        "fail:src/leak.ts:term:i18n",
        "warn:docs/superpowers/specs/x.md:term:tenant-selector",
      ],
    );
    expect(blockingFindings(generic, false)).toHaveLength(3);
    expect(blockingFindings(generic, true)).toHaveLength(4);
    const full = scanFiles(collectFiles(root), parseTerms(EXAMPLE));
    expect(
      full
        .filter((f) => f.rule === "term:example-customer")
        .map((f) => f.path)
        .sort(),
    ).toEqual(["packages/ui-atoms/dist/components/leak.js", "src/customer.ts"]);
    expect(blockingFindings([], true)).toEqual([]);
  });
});
