import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const manifest = (path: string) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8")) as {
    name: string;
    devDependencies?: Record<string, string>;
  };

describe("package names (npm scope @tilli.dev)", () => {
  it("names both packages in the @tilli.dev scope", () => {
    expect(manifest("packages/ui-atoms/package.json").name).toBe(
      "@tilli.dev/ui-atoms",
    );
    expect(manifest("packages/icons/package.json").name).toBe(
      "@tilli.dev/icons",
    );
  });

  it("leaves no reference to the old names in any tracked file", () => {
    // A published name is permanent, so the old one must not survive anywhere.
    let hits = "";
    try {
      hits = execFileSync(
        "git",
        [
          "-C",
          root,
          "grep",
          "-nE",
          "@tilli-pro/(ui-atoms|icons)|tilli-pro-(ui-atoms|icons)",
        ],
        { encoding: "utf8" },
      );
    } catch (error) {
      if ((error as { status?: number }).status !== 1) throw error; // 1 = no match
    }
    expect(hits).toBe("");
  });

  it("keeps the shared lint config under its own scope", () => {
    expect(manifest("package.json").devDependencies).toHaveProperty(
      "@tilli-pro/biome",
    );
  });
});
