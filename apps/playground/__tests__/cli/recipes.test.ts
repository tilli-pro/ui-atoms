import { describe, expect, it } from "vitest";
import {
  addRecipe,
  bumpRecipe,
  formatDate,
  removeRecipe,
} from "../../src/cli/recipes.js";
import { makeRecipe } from "../helpers/recipes.js";

const existing = [makeRecipe("nested-sidebar"), makeRecipe("zebra")];

describe("formatDate", () => {
  it("formats the local calendar date", () => {
    expect(formatDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("addRecipe", () => {
  it("adds a 1.0.0 recipe with an initial changelog entry, kept sorted by slug", () => {
    const { recipes, recipe } = addRecipe(
      existing,
      {
        name: "  Login Form ",
        description: " Email + password ",
        components: ["input", "button", "input"],
      },
      "2026-11-08",
      ["button", "input"],
    );
    expect(recipe).toEqual({
      slug: "login-form",
      title: "Login Form",
      description: "Email + password",
      version: "1.0.0",
      components: ["button", "input"],
      changelog: [
        { version: "1.0.0", date: "2026-11-08", changes: "Initial recipe." },
      ],
    });
    expect(recipes.map((r) => r.slug)).toEqual([
      "login-form",
      "nested-sidebar",
      "zebra",
    ]);
  });

  it("does not mutate its input", () => {
    const before = structuredClone(existing);
    addRecipe(existing, { name: "Other" }, "2026-11-08");
    expect(existing).toEqual(before);
  });

  it("refuses duplicates, invalid input and unknown components", () => {
    expect(() =>
      addRecipe(existing, { name: "Nested Sidebar" }, "2026-11-08"),
    ).toThrow(/already exists/);
    expect(() => addRecipe(existing, { name: "" }, "2026-11-08")).toThrow(
      /required/,
    );
    expect(() =>
      addRecipe(
        existing,
        { name: "Ok", description: "d".repeat(1025) },
        "2026-11-08",
      ),
    ).toThrow(/1024/);
    expect(() =>
      addRecipe(existing, { name: "Ok", components: ["nope"] }, "2026-11-08", [
        "button",
      ]),
    ).toThrow(/Unknown ui-atoms component\(s\): nope/);
  });
});

describe("bumpRecipe", () => {
  it("bumps the version and appends a dated changelog entry", () => {
    const { recipes, recipe } = bumpRecipe(
      existing,
      "nested-sidebar",
      "minor",
      " Added a footer ",
      "2026-11-09",
    );
    expect(recipe.version).toBe("1.1.0");
    expect(recipe.changelog).toEqual([
      { version: "1.0.0", date: "2026-01-01", changes: "Initial recipe." },
      { version: "1.1.0", date: "2026-11-09", changes: "Added a footer" },
    ]);
    expect(recipes[0]).toBe(recipe);
    expect(recipes[1]).toBe(existing[1]);
    expect(existing.map((r) => r.version)).toEqual(["1.0.0", "1.0.0"]);
  });

  it("refuses unknown slugs and missing or oversized changes", () => {
    expect(() =>
      bumpRecipe(existing, "missing", "patch", "x", "2026-11-09"),
    ).toThrow(/No recipe/);
    expect(() =>
      bumpRecipe(existing, "zebra", "patch", "", "2026-11-09"),
    ).toThrow(/Describe/);
    expect(() =>
      bumpRecipe(existing, "zebra", "patch", "c".repeat(2049), "2026-11-09"),
    ).toThrow(/2048/);
  });
});

describe("removeRecipe", () => {
  it("removes the entry", () => {
    expect(removeRecipe(existing, "zebra").map((r) => r.slug)).toEqual([
      "nested-sidebar",
    ]);
  });

  it("refuses unknown slugs", () => {
    expect(() => removeRecipe(existing, "missing")).toThrow(/No recipe/);
  });
});
