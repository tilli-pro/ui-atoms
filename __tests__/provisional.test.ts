import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { provisionalBlock } from "../scripts/check-provisional.js";
import { PROVISIONAL } from "../scripts/gen-exports.js";

const read = (path: string) =>
  readFileSync(resolve(import.meta.dirname, "..", path), "utf8");

const scripts = (
  JSON.parse(read("package.json")) as { scripts: Record<string, string> }
).scripts;
const exportsMap = (
  JSON.parse(read("packages/ui-atoms/package.json")) as {
    exports: Record<string, unknown>;
  }
).exports;

describe("the provisional-subpath publish guard", () => {
  it("blocks while something is provisional and clears when nothing is", () => {
    expect(provisionalBlock([])).toBeNull();
    expect(provisionalBlock(["currency-input"])).toContain("./currency-input");
  });

  it("only lists subpaths the package actually exports", () => {
    // A stale entry would block publishing forever for no reason; a misspelt one
    // would look like a guard while guarding nothing.
    for (const name of PROVISIONAL)
      expect(exportsMap, name).toHaveProperty(`./${name}`);
  });

  it("runs ahead of `changeset publish` in the release script", () => {
    // The whole point is that the irreversible step cannot run first.
    expect(scripts).toHaveProperty("check-provisional");
    const release = scripts.release;
    expect(release).toContain("check-provisional");
    expect(release.indexOf("check-provisional")).toBeLessThan(
      release.indexOf("changeset publish"),
    );
  });

  it("names nothing: every decision it was holding has landed", () => {
    // Adding or removing a name here is how the guard is raised and lifted, so
    // either has to be a deliberate edit that shows up in this test's diff.
    // CTX-1 (context-menu, adopted) and CUR-1 (currency-input, re-authored on
    // number-field) were both answered on 2026-09-20; nothing is open.
    expect([...PROVISIONAL]).toEqual([]);
  });

  it("`check-provisional` exits 0 on the empty list, so `release` gets past it", () => {
    // The unit above proves the message; this proves the exit code the release
    // script actually depends on.
    const root = resolve(import.meta.dirname, "..");
    const out = execFileSync(
      resolve(root, "node_modules", ".bin", "tsx"),
      [resolve(root, "scripts", "check-provisional.ts")],
      { cwd: root, encoding: "utf8" },
    );
    expect(out).toContain("no provisional subpaths");
  });
});
