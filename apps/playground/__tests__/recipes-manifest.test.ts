import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  diffRecipeModules,
  parseManifest,
  type Recipe,
  serializeManifest,
  slugFromModulePath,
} from "../src/recipes-manifest.js";
import { makeRecipe } from "./helpers/recipes.js";

const PLAYGROUND = resolve(import.meta.dirname, "..");
const BIOME = createRequire(import.meta.url).resolve(
  "@biomejs/biome/bin/biome",
);

/** What the repo's Biome config would make of `source` as apps/playground/recipes.json. */
function biomeFormat(source: string): string {
  return execFileSync(
    process.execPath,
    [
      BIOME,
      "format",
      `--stdin-file-path=${resolve(PLAYGROUND, "recipes.json")}`,
    ],
    { cwd: PLAYGROUND, encoding: "utf8", input: source },
  );
}

describe("parseManifest", () => {
  it("accepts a valid manifest", () => {
    const recipes = [makeRecipe("a"), makeRecipe("b")];
    expect(parseManifest(structuredClone(recipes))).toEqual(recipes);
  });

  it.each<[string, unknown, RegExp]>([
    ["a non-array", {}, /must be an array/],
    ["a bad slug", [makeRecipe("Bad Slug")], /not a kebab-case slug/],
    [
      "a bad version",
      [makeRecipe("a", { version: "1.0" })],
      /MAJOR.MINOR.PATCH/,
    ],
    [
      "a duplicate slug",
      [makeRecipe("a"), makeRecipe("a")],
      /duplicate slug "a"/,
    ],
    [
      "an unknown key",
      [{ ...makeRecipe("a"), extra: true }],
      /unknown key\(s\) extra/,
    ],
    [
      "a stale changelog",
      [{ ...makeRecipe("a"), version: "1.0.1" }],
      /last changelog entry must be for version 1.0.1/,
    ],
    [
      "an oversized description",
      [makeRecipe("a", { description: "d".repeat(1025) })],
      /description exceeds 1024/,
    ],
    [
      "a bad date",
      [
        makeRecipe("a", {
          changelog: [{ version: "1.0.0", date: "8/11/2026", changes: "x" }],
        }),
      ],
      /not YYYY-MM-DD/,
    ],
    [
      "duplicate components",
      [makeRecipe("a", { components: ["card", "card"] })],
      /duplicates/,
    ],
  ])("rejects %s", (_, value, message) => {
    expect(() => parseManifest(value)).toThrow(message);
  });
});

describe("serializeManifest", () => {
  it("sorts recipes by slug and components alphabetically, with stable key order", () => {
    const shuffled = {
      changelog: [{ changes: "c", date: "2026-01-01", version: "1.0.0" }],
      components: ["switch", "label"],
      version: "1.0.0",
      description: "",
      title: "B",
      slug: "b",
    } as Recipe;
    const text = serializeManifest([shuffled, makeRecipe("a")]);
    const [first, second] = JSON.parse(text) as Recipe[];
    expect(first?.slug).toBe("a");
    expect(Object.keys(second ?? {})).toEqual([
      "slug",
      "title",
      "description",
      "version",
      "components",
      "changelog",
    ]);
    expect(second?.components).toEqual(["label", "switch"]);
    expect(Object.keys(second?.changelog[0] ?? {})).toEqual([
      "version",
      "date",
      "changes",
    ]);
    expect(text.endsWith("]\n")).toBe(true);
  });

  it("is a fixed point of the repo's Biome formatter, including at the 80-column boundary", () => {
    // `    "components": [...],` is 4 + 14 + len + 1 columns; sweep lengths around 80.
    const recipes = Array.from({ length: 12 }, (_, i) =>
      makeRecipe(`r${String(i).padStart(2, "0")}`, {
        components: [`${"a".repeat(50 + i)}`, "b"],
        description: i % 2 ? "x".repeat(300) : "",
        changelog: [
          { version: "1.0.0", date: "2026-01-01", changes: "Initial recipe." },
        ],
      }),
    );
    recipes.push(
      makeRecipe("many", {
        components: Array.from({ length: 30 }, (_, i) => `component-${i}`),
      }),
      makeRecipe("none"),
    );
    const text = serializeManifest(recipes);
    expect(biomeFormat(text)).toBe(text);
  });
});

describe("slugFromModulePath", () => {
  it("extracts the slug from a glob key or file name", () => {
    expect(slugFromModulePath("./recipes/nested-sidebar.tsx")).toBe(
      "nested-sidebar",
    );
    expect(slugFromModulePath("card.tsx")).toBe("card");
    expect(slugFromModulePath("./recipes/beacon-ui-ux/index.tsx")).toBe(
      "beacon-ui-ux",
    );
    expect(slugFromModulePath("beacon-ui-ux/index.tsx")).toBe("beacon-ui-ux");
    expect(slugFromModulePath("./recipes/beacon-ui-ux/rail.tsx")).toBe("rail");
    expect(slugFromModulePath("notes.md")).toBe(undefined);
  });
});

describe("diffRecipeModules", () => {
  it("reports entries without modules and modules without entries", () => {
    expect(diffRecipeModules(["a", "b", "c"], ["c", "d", "a"])).toEqual({
      missingModules: ["b"],
      missingEntries: ["d"],
    });
  });
});
