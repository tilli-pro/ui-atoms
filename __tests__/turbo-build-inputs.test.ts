import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const turbo = JSON.parse(readFileSync(join(root, "turbo.json"), "utf8")) as {
  globalDependencies?: string[];
  tasks: Record<string, { inputs?: string[]; outputs?: string[] }>;
};
const pkg = JSON.parse(
  readFileSync(join(root, "packages/ui-atoms/package.json"), "utf8"),
) as { scripts: Record<string, string> };

// Workspace-root files the package build copies into itself, e.g.
// `cp ../../LICENSE ../../THIRD-PARTY-NOTICES.md .`
const copiedFromRoot = [
  ...pkg.scripts.build.matchAll(/\.\.\/\.\.\/([\w.-]+)/g),
].map((m) => m[1]);

const build = turbo.tasks.build;

describe("turbo build cache keys", () => {
  it("knows which workspace-root files the build copies in", () => {
    expect(copiedFromRoot).toEqual(["LICENSE", "THIRD-PARTY-NOTICES.md"]);
  });

  it("hashes every workspace-root file the build reads", () => {
    // Without these, editing a root file is not a cache-buster: the build is a
    // cache hit and restores the previous — now stale — copy into the package,
    // which `pnpm pack` then ships.
    for (const file of copiedFromRoot) {
      const declared =
        build.inputs?.includes(`$TURBO_ROOT$/${file}`) ||
        turbo.globalDependencies?.includes(file);
      expect(declared, `${file} is not a build cache key`).toBe(true);
    }
  });

  it("keeps the package's own sources as inputs alongside them", () => {
    if (build.inputs) expect(build.inputs).toContain("$TURBO_DEFAULT$");
  });

  it("declares the copies as outputs, so a cache hit restores them", () => {
    for (const file of copiedFromRoot) expect(build.outputs).toContain(file);
  });
});
