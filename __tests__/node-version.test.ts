import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

const PIN = /^nodejs (\d+\.\d+\.\d+)$/m;
const SETUP_NODE =
  /uses: actions\/setup-node@\S+\n\s+with:\n((?:\s{10,}.+\n)+)/g;
const FLOATING = /^\s*node-version:/m;

// `.tool-versions` is the one Node version source: mise reads it locally and every
// `actions/setup-node` step reads it in CI with `node-version-file`.
describe("the Node version source", () => {
  it("pins one exact Node version in .tool-versions, and .nvmrc is gone", () => {
    expect(read(".tool-versions")).toMatch(PIN);
    expect(read(".tool-versions").trim().split("\n")).toHaveLength(1);
    expect(existsSync(resolve(root, ".nvmrc"))).toBe(false);
  });

  it("is what every setup-node step in every workflow reads", () => {
    const workflows = readdirSync(resolve(root, ".github/workflows")).filter(
      (name) => name.endsWith(".yml") || name.endsWith(".yaml"),
    );
    let steps = 0;
    for (const name of workflows) {
      const text = read(`.github/workflows/${name}`);
      // A hard-coded or floating version anywhere would drift from the pin.
      expect(text, `${name} sets node-version directly`).not.toMatch(FLOATING);
      const found = [...text.matchAll(SETUP_NODE)];
      expect(
        found.length,
        `${name}: every setup-node step needs a with: block`,
      ).toBe(text.split("actions/setup-node@").length - 1);
      for (const [, options = ""] of found) {
        steps++;
        expect(options, name).toContain("node-version-file: .tool-versions");
      }
    }
    expect(steps).toBeGreaterThanOrEqual(8);
  });

  it("satisfies the engines range, and is new enough for npm trusted publishing", () => {
    const version = PIN.exec(read(".tool-versions"))?.[1] ?? "";
    const major = Number(version.split(".")[0]);
    const engines = (
      JSON.parse(read("package.json")) as { engines?: { node?: string } }
    ).engines?.node;
    expect(engines).toBe(">=22");
    expect(major).toBeGreaterThanOrEqual(22);
    // The release job publishes through npm's OIDC trusted publishing, which needs the npm
    // that ships with Node 24 or later.
    expect(major).toBeGreaterThanOrEqual(24);
  });

  it("is the version the contributing guide tells people to install, with mise", () => {
    const version = PIN.exec(read(".tool-versions"))?.[1] ?? "";
    const guide = read("CONTRIBUTING.md");
    expect(guide).toContain(`Node ${version}`);
    expect(guide).toContain("mise install");
    expect(guide).not.toMatch(/\bnvm\b/);
  });
});
