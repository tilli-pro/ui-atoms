import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateExports, listComponentDirs } from "../scripts/gen-exports.js";

describe("gen-exports", () => {
  it("lists component directories that have an index.tsx, sorted", () => {
    const root = mkdtempSync(join(tmpdir(), "ui-atoms-"));
    for (const name of ["button", "alert", "broken"])
      mkdirSync(join(root, "components", name), { recursive: true });
    writeFileSync(
      join(root, "components", "button", "index.tsx"),
      "export {};",
    );
    writeFileSync(join(root, "components", "alert", "index.tsx"), "export {};");
    expect(listComponentDirs(root)).toEqual(["alert", "button"]);
  });
  it("emits fixed entries plus one subpath per component with types first", () => {
    const exp = generateExports(["alert", "button"]);
    expect(Object.keys(exp)).toEqual([
      "./package.json",
      "./styles.css",
      "./utils",
      "./formatters",
      "./hooks",
      "./alert",
      "./button",
    ]);
    expect(exp["./button"]).toEqual({
      types: "./dist/components/button/index.d.ts",
      import: "./dist/components/button/index.js",
      default: "./dist/components/button/index.js",
    });
    expect(exp["./styles.css"]).toBe("./dist/styles.css");
    expect(exp["./utils"]).toEqual({
      types: "./dist/utils.d.ts",
      import: "./dist/utils.js",
      default: "./dist/utils.js",
    });
  });
});
