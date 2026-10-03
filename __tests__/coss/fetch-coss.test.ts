import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  committedBaseFindings,
  type Lock,
  rawUrl,
  revisionMismatches,
  type ServedFile,
  sha256,
} from "../../scripts/coss/fetch-coss.js";
import { COSS } from "../../scripts/coss/manifest.js";

const ROOT = resolve(import.meta.dirname, "..", "..");
const REAL_LOCK = JSON.parse(
  readFileSync(join(ROOT, "scripts", "coss", "coss-lock.json"), "utf8"),
) as Lock;

const EXT_RE = /\.tsx?$/;
const REGISTRY_PATH_RE = /^registry\/default\/(ui|lib)\//;
const CARVE_OUT_RE = /only apps\/ui\/registry/;

const temps: string[] = [];
function scratch(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "coss-base-"));
  temps.push(dir);
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(dir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of temps.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function lockOf(files: Record<string, string>): Lock {
  return {
    revision: "0".repeat(40),
    revisionDate: "2026-09-16",
    revisionSource: "https://example.invalid",
    fetchedAt: "2026-09-16",
    revisionVerifiedAt: "2026-09-16",
    files: Object.fromEntries(
      Object.entries(files).map(([base, content]) => [
        base.replace(EXT_RE, ""),
        {
          registry: base.replace(EXT_RE, ""),
          path: `registry/default/ui/${base}`,
          base,
          sha256: sha256(content),
          dependencies: [],
          registryDependencies: [],
        },
      ]),
    ),
  };
}

describe("the committed .coss-base/ bytes", () => {
  it("still match coss-lock.json exactly", () => {
    // The directory exists only as byte-identical upstream provenance, so this is a
    // property of the repository, not of a run: it must hold with no network at all.
    expect(committedBaseFindings(REAL_LOCK, join(ROOT, ".coss-base"))).toEqual(
      [],
    );
  });

  it("locks one entry per file on disk, all of them under the pinned revision", () => {
    expect(Object.keys(REAL_LOCK.files)).toHaveLength(55);
    expect(REAL_LOCK.revision).toBe(COSS.revision);
    expect(REAL_LOCK.revisionDate).toBe(COSS.revisionDate);
    for (const [key, entry] of Object.entries(REAL_LOCK.files)) {
      expect(entry.path, key).toMatch(REGISTRY_PATH_RE);
      expect(entry.base, key).toBe(
        key.startsWith("lib/") ? `${key}.ts` : `${key}.tsx`,
      );
    }
  });
});

describe("committedBaseFindings", () => {
  it("reports a file that was edited after the fetch", () => {
    const l = lockOf({ "select.tsx": "export const Select = 1;\n" });
    const dir = scratch({ "select.tsx": "export const Select = 2;\n" });
    expect(committedBaseFindings(l, dir)).toEqual([
      expect.stringContaining("select.tsx: edited since the fetch"),
    ]);
  });

  it("reports a locked file that is missing from the tree", () => {
    const l = lockOf({ "select.tsx": "export const Select = 1;\n" });
    expect(committedBaseFindings(l, scratch({}))).toEqual([
      expect.stringContaining("select.tsx: missing from .coss-base/"),
    ]);
  });

  it("reports a file nobody locked", () => {
    const l = lockOf({ "select.tsx": "export const Select = 1;\n" });
    const dir = scratch({
      "select.tsx": "export const Select = 1;\n",
      "lib/stray.ts": "export const stray = true;\n",
    });
    expect(committedBaseFindings(l, dir)).toEqual([
      "lib/stray.ts: present in .coss-base/ but not in the lock",
    ]);
  });

  it("is silent on an intact tree", () => {
    const l = lockOf({
      "select.tsx": "export const Select = 1;\n",
      "lib/segmented-control.ts": "export const size = 1;\n",
    });
    const dir = scratch({
      "select.tsx": "export const Select = 1;\n",
      "lib/segmented-control.ts": "export const size = 1;\n",
    });
    expect(committedBaseFindings(l, dir)).toEqual([]);
  });
});

describe("rawUrl", () => {
  it("addresses one registry file inside apps/ui at an exact revision", () => {
    expect(rawUrl(COSS.revision, "registry/default/ui/separator.tsx")).toBe(
      `https://raw.githubusercontent.com/cosscom/coss/${COSS.revision}/apps/ui/registry/default/ui/separator.tsx`,
    );
  });

  it("refuses anything outside apps/ui/registry/ (the AGPL carve-out)", () => {
    expect(() => rawUrl(COSS.revision, "../../LICENSE")).toThrow(CARVE_OUT_RE);
    expect(() => rawUrl(COSS.revision, "app/page.tsx")).toThrow(CARVE_OUT_RE);
  });
});

describe("revisionMismatches", () => {
  const separator: ServedFile = {
    key: "separator",
    path: "registry/default/ui/separator.tsx",
    content: "a\n",
  };
  const select: ServedFile = {
    key: "select",
    path: "registry/default/ui/select.tsx",
    content: "b\n",
  };
  const served = [separator, select];
  const reader =
    (at: Map<string, string>) =>
    async (url: string): Promise<string | null> =>
      at.get(url) ?? null;

  it("passes when the registry serves exactly the source at that revision", async () => {
    const at = new Map([
      [rawUrl(COSS.revision, separator.path), separator.content],
      [rawUrl(COSS.revision, select.path), select.content],
    ]);
    expect(await revisionMismatches(served, COSS.revision, reader(at))).toEqual(
      [],
    );
  });

  it("names the file when the registry has moved ahead of the pin", async () => {
    const at = new Map([
      [rawUrl(COSS.revision, separator.path), separator.content],
      [rawUrl(COSS.revision, select.path), "b-but-older\n"],
    ]);
    expect(await revisionMismatches(served, COSS.revision, reader(at))).toEqual(
      [
        expect.stringContaining(
          "select: the registry serves bytes that are not",
        ),
      ],
    );
  });

  it("names the file when it does not exist at the pinned revision", async () => {
    const bad = await revisionMismatches(
      served,
      COSS.revision,
      reader(new Map()),
    );
    expect(bad).toHaveLength(2);
    expect(bad[0]).toContain("does not exist at");
  });
});
