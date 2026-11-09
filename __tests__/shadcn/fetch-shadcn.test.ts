import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { committedBaseFindings } from "../../scripts/coss/fetch-coss.js";
import { COMPONENTS } from "../../scripts/coss/manifest.js";
import {
  type ShadcnLock,
  templateUrl,
} from "../../scripts/shadcn/fetch-shadcn.js";
import { SHADCN, SHADCN_COMPONENTS } from "../../scripts/shadcn/manifest.js";

const ROOT = resolve(import.meta.dirname, "..", "..");
const REAL_LOCK = JSON.parse(
  readFileSync(join(ROOT, "scripts", "shadcn", "shadcn-lock.json"), "utf8"),
) as ShadcnLock;

const SHA40_RE = /^[0-9a-f]{40}$/;
const SHA256_RE = /^[0-9a-f]{64}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SERVED_PATH_RE = /^registry\/base-nova\/ui\//;
const TEMPLATE_PATH_RE = /^registry\/bases\/base\/ui\//;
const CARVE_OUT_RE = /only apps\/v4\/registry/;

describe("SHADCN pin", () => {
  it("fetches one style from the shadcn registry", () => {
    expect(SHADCN.style).toBe("base-nova");
    expect(SHADCN.registry).toBe(
      `https://ui.shadcn.com/r/styles/${SHADCN.style}`,
    );
    expect(SHADCN.repo).toBe("https://github.com/shadcn-ui/ui");
  });
});

describe("SHADCN_COMPONENTS", () => {
  it("is exactly the components the coss manifest marks as shadcn-sourced (none today)", () => {
    const fromCoss = COMPONENTS.filter((c) => c.source === "shadcn").map(
      (c) => c.name,
    );
    expect(SHADCN_COMPONENTS.map((c) => c.name)).toEqual(fromCoss);
    expect(fromCoss).toEqual([]);
  });
  it("names a template under the Base UI base for every item", () => {
    for (const c of SHADCN_COMPONENTS) {
      expect(c.template, c.name).toMatch(TEMPLATE_PATH_RE);
      expect(c.template.endsWith(`/${c.registry}.tsx`), c.name).toBe(true);
    }
  });
});

describe("the committed .shadcn-base/ bytes", () => {
  it("still match shadcn-lock.json exactly", () => {
    // The directory exists only as byte-identical registry provenance, so this is a
    // property of the repository, not of a run: it must hold with no network at all.
    expect(
      committedBaseFindings(
        REAL_LOCK,
        join(ROOT, ".shadcn-base"),
        ".shadcn-base",
      ),
    ).toEqual([]);
  });

  it("locks one entry per manifest item, served path and template provenance recorded", () => {
    expect(Object.keys(REAL_LOCK.files)).toEqual(
      SHADCN_COMPONENTS.map((c) => c.name),
    );
    expect(REAL_LOCK.style).toBe(SHADCN.style);
    expect(REAL_LOCK.registry).toBe(SHADCN.registry);
    expect(REAL_LOCK.fetchedAt).toMatch(DATE_RE);
    for (const [key, entry] of Object.entries(REAL_LOCK.files)) {
      const manifest = SHADCN_COMPONENTS.find((c) => c.name === key);
      expect(manifest, key).toBeDefined();
      expect(entry.base, key).toBe(`${key}.tsx`);
      expect(entry.path, key).toMatch(SERVED_PATH_RE);
      expect(entry.sha256, key).toMatch(SHA256_RE);
      expect(entry.template.path, key).toBe(manifest?.template);
      expect(entry.template.revision, key).toMatch(SHA40_RE);
      expect(entry.template.revisionDate, key).toMatch(DATE_RE);
    }
  });

  it("labels its findings with the shadcn directory, not the coss one", () => {
    const ghost = {
      registry: "ghost",
      path: "registry/base-nova/ui/ghost.tsx",
      base: "ghost.tsx",
      sha256: "0".repeat(64),
      dependencies: [],
      registryDependencies: [],
      template: { path: "", revision: "", revisionDate: "" },
    };
    const findings = committedBaseFindings(
      { files: { ghost } },
      join(ROOT, ".shadcn-base"),
      ".shadcn-base",
    );
    expect(findings).toEqual([
      "ghost.tsx: missing from .shadcn-base/ (locked for ghost)",
    ]);
  });
});

describe("templateUrl", () => {
  it("addresses one template inside apps/v4/registry at an exact revision", () => {
    const sha = "c257f688cf4de7ec10cc1be84cad29cd4631182c";
    expect(templateUrl(sha, "registry/bases/base/ui/sidebar.tsx")).toBe(
      `https://raw.githubusercontent.com/shadcn-ui/ui/${sha}/apps/v4/registry/bases/base/ui/sidebar.tsx`,
    );
  });

  it("refuses anything outside apps/v4/registry/", () => {
    expect(() => templateUrl("main", "../../LICENSE.md")).toThrow(CARVE_OUT_RE);
    expect(() => templateUrl("main", "app/page.tsx")).toThrow(CARVE_OUT_RE);
  });
});
