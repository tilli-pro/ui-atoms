import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(import.meta.dirname, "..", path), "utf8");

const workflow = read(".github/workflows/publish.yml");
const gitignore = read(".gitignore");
const scripts = (
  JSON.parse(read("package.json")) as { scripts: Record<string, string> }
).scripts;
type Manifest = {
  name: string;
  publishConfig?: unknown;
  repository?: { url: string };
};
const manifest = JSON.parse(read("packages/ui-atoms/package.json")) as Manifest;
const icons = JSON.parse(read("packages/icons/package.json")) as Manifest;

// `changeset version` deletes the changesets it consumes, so this suite checks whichever are
// pending and passes when there are none (the public snapshot has none).
const pendingChangesets = readdirSync(
  resolve(import.meta.dirname, "..", ".changeset"),
)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .map((file) => ({ file, text: read(`.changeset/${file}`) }));
const FRONT_MATTER = /^---\n"([^"]+)": (\w+)\n---\n/;
const CHANGESETS_COMMAND = /^ +(?:publish|version): pnpm (\S+)$/gm;

describe("pending changesets", () => {
  it("survives a release that has consumed them all", () => {
    expect(Array.isArray(pendingChangesets)).toBe(true);
  });
  it.each(pendingChangesets)(
    "$file names the published package and a valid bump",
    ({ text }) => {
      const front = FRONT_MATTER.exec(text);
      expect(front, 'front matter must be `"<name>": <bump>`').not.toBeNull();
      expect(front?.[1]).toBe(manifest.name);
      expect(["patch", "minor", "major"]).toContain(front?.[2]);
    },
  );
  it.each(pendingChangesets)(
    "$file carries a summary for the changelog",
    ({ text }) => {
      expect(text.split("---\n")[2]?.trim().length).toBeGreaterThan(0);
    },
  );
});

describe("the public release workflow (publish.yml)", () => {
  it("runs on pushes to main, and only in the public repository", () => {
    expect(workflow).toMatch(/on:\n {2}push:\n {4}branches: \[main\]/);
    expect(workflow).toMatch(
      /^ {4}if: github\.repository == 'tilli-pro\/ui-atoms'$/m,
    );
  });
  it("drives changesets through scripts this repository defines", () => {
    const commands = [...workflow.matchAll(CHANGESETS_COMMAND)].map(
      (m) => m[1] as string,
    );
    expect(commands).toEqual(["release", "version-packages"]);
    for (const command of commands) expect(scripts).toHaveProperty(command);
  });
  it("can request the OIDC token provenance needs", () => {
    expect(workflow).toMatch(
      /^permissions:\n(?: {2}.+\n)* {2}id-token: write$/m,
    );
  });
  it("asks npm for public access and provenance in both manifests", () => {
    for (const pkg of [manifest, icons])
      expect(pkg.publishConfig, pkg.name).toEqual({
        access: "public",
        provenance: true,
      });
  });
  it("names the repository npm checks provenance against", () => {
    expect(manifest.repository?.url).toBe(
      "git+https://github.com/tilli-pro/ui-atoms.git",
    );
  });
});

describe("the publish and tarball scripts", () => {
  it("scan, guard and build before changeset publish", () => {
    const release = scripts.release ?? "";
    for (const step of ["content-scan", "check-provisional", "build"])
      expect(release.indexOf(step), step).toBeLessThan(
        release.indexOf("changeset publish"),
      );
  });
  it("build the local tarball behind the same gates as a publish", () => {
    // `pnpm pack` does not rebuild, so a bare pack can ship a stale dist.
    const steps = (scripts["pack:tarball"] ?? "")
      .split("&&")
      .map((step) => step.trim());
    expect(steps).toEqual([
      "pnpm content-scan",
      "pnpm check-provisional",
      "pnpm build",
      "pnpm -C packages/ui-atoms pack --pack-destination ../../.tarballs",
    ]);
    expect(gitignore.split("\n")).toContain(".tarballs/");
  });
});
