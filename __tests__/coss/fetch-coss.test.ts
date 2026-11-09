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
  componentFiles,
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
const REGISTRY_PATH_RE = /^registry\/default\/(ui|lib|hooks|chat)\//;
/** A `.ts` base: a vendored lib or hook, or one inside a multi-file kit (`chat/hooks/…`). */
const TS_BASE_KEY_RE = /^(chat\/)?(lib|hooks)\//;
const CHAT_KEY_RE = /^chat\//;
const SHA40_RE = /^[0-9a-f]{40}$/;
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

  it("locks one entry per file on disk: at the pinned revision, or digest-pinned with provenance", () => {
    expect(Object.keys(REAL_LOCK.files)).toHaveLength(86);
    expect(REAL_LOCK.revision).toBe(COSS.revision);
    expect(REAL_LOCK.revisionDate).toBe(COSS.revisionDate);
    for (const [key, entry] of Object.entries(REAL_LOCK.files)) {
      expect(entry.path, key).toMatch(REGISTRY_PATH_RE);
      expect(entry.base, key).toBe(
        TS_BASE_KEY_RE.test(key) ? `${key}.ts` : `${key}.tsx`,
      );
      if (CHAT_KEY_RE.test(key)) {
        expect(entry.path, key).toBe(`registry/default/${entry.base}`);
        expect(entry.provenance?.path, key).toBe(
          `packages/ui/src/${entry.base}`,
        );
      }
      if (entry.provenance) {
        expect(entry.provenance.path, key).toMatch(/^packages\/ui\/src\//);
        expect(entry.provenance.revision, key).toMatch(SHA40_RE);
        expect(entry.provenance.revisionDate, key).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
      }
    }
    expect(
      Object.entries(REAL_LOCK.files)
        .filter(([, e]) => e.provenance)
        .map(([k]) => k)
        .sort(),
    ).toEqual([
      "chat/chat-bubble",
      "chat/chat-collapsible-message",
      "chat/chat-conversation",
      "chat/chat-date-pill",
      "chat/chat-delivery-indicator",
      "chat/chat-jump-to-latest-button",
      "chat/chat-members",
      "chat/chat-message",
      "chat/chat-message-actions",
      "chat/chat-message-bubble",
      "chat/chat-message-info",
      "chat/chat-message-layout",
      "chat/chat-message-text",
      "chat/chat-reaction-chip",
      "chat/chat-reaction-picker",
      "chat/chat-reply-preview",
      "chat/chat-reply-reference",
      "chat/chat-states",
      "chat/chat-typing-indicator",
      "chat/chat-unread-divider",
      "chat/hooks/use-chat-popup-dismissal",
      "chat/hooks/use-chat-scroll",
      "chat/lib/split-chat-message-preview",
      "composer",
      "hooks/use-composer-editor",
      "lib/composer-clipboard",
      "lib/composer-document",
      "lib/composer-editor",
      "lib/composer-query",
    ]);
  });

  it("ignores the .gitkeep that holds an empty base directory", () => {
    const l = lockOf({});
    const dir = scratch({ ".gitkeep": "" });
    expect(committedBaseFindings(l, dir)).toEqual([]);
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

describe("componentFiles", () => {
  const file = (path: string, type = "registry:component") => ({
    path,
    type,
    content: "x\n",
  });

  it("locks the registry:ui file of a single-file item under the component name", () => {
    const got = componentFiles({ name: "select" }, "select", {
      files: [
        file("registry/default/lib/utils.ts", "registry:lib"),
        file("registry/default/ui/select.tsx", "registry:ui"),
      ],
    });
    expect(got.map(({ key, base, file }) => [key, base, file.path])).toEqual([
      ["select", "select.tsx", "registry/default/ui/select.tsx"],
    ]);
  });

  it("locks every file of a multi-file kit under <name>/, with per-file provenance", () => {
    const got = componentFiles(
      { name: "chat", multiFile: true, postPin: "packages/ui/src/chat" },
      "chat",
      {
        files: [
          file("registry/default/chat/chat-bubble.tsx"),
          file("registry/default/chat/hooks/use-chat-scroll.ts"),
        ],
      },
    );
    expect(got.map(({ key, base, postPin }) => [key, base, postPin])).toEqual([
      [
        "chat/chat-bubble",
        "chat/chat-bubble.tsx",
        "packages/ui/src/chat/chat-bubble.tsx",
      ],
      [
        "chat/hooks/use-chat-scroll",
        "chat/hooks/use-chat-scroll.ts",
        "packages/ui/src/chat/hooks/use-chat-scroll.ts",
      ],
    ]);
  });

  it("refuses a kit file served outside the item's own directory", () => {
    expect(() =>
      componentFiles({ name: "chat", multiFile: true }, "chat", {
        files: [file("registry/default/ui/button.tsx")],
      }),
    ).toThrow(/outside registry\/default\/chat\//);
  });
});

describe("rawUrl", () => {
  it("addresses one registry file inside apps/ui at an exact revision", () => {
    expect(rawUrl(COSS.revision, "registry/default/ui/separator.tsx")).toBe(
      `https://raw.githubusercontent.com/cosscom/ui/${COSS.revision}/apps/ui/registry/default/ui/separator.tsx`,
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
