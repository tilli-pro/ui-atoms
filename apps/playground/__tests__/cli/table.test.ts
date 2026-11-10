import { describe, expect, it } from "vitest";
import { formatRecipeTable } from "../../src/cli/table.js";
import { makeRecipe } from "../helpers/recipes.js";

describe("formatRecipeTable", () => {
  it("prints slug, title, version and component count in aligned columns", () => {
    const table = formatRecipeTable([
      makeRecipe("nested-sidebar", {
        components: ["label", "sidebar", "switch"],
      }),
      makeRecipe("x", { title: "A".repeat(60), version: "12.0.3" }),
    ]);
    expect(table.split("\n")).toEqual([
      "SLUG            TITLE                                     VERSION  COMPONENTS",
      "--------------  ----------------------------------------  -------  ----------",
      "nested-sidebar  Nested sidebar                            1.0.0             3",
      `x               ${"A".repeat(39)}…  12.0.3            0`,
    ]);
  });
});
