import { describe, expect, it } from "vitest";
import { componentNameFromSlug, slugify } from "../../src/cli/slug.js";

describe("slugify", () => {
  it.each([
    ["Nested sidebar", "nested-sidebar"],
    ["  Settings   Dialog  ", "settings-dialog"],
    ["Card/Grid (v2)!", "card-grid-v2"],
    ["Café Menü", "cafe-menu"],
    ["--already-kebab--", "already-kebab"],
    ["UPPER_snake_Case", "upper-snake-case"],
    ["3D cards", "3d-cards"],
  ])("%j -> %j", (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it("returns an empty slug when nothing alphanumeric is left", () => {
    expect(slugify("!!! ???")).toBe("");
    expect(slugify("日本語")).toBe("");
  });

  it("truncates to the max length without a trailing dash", () => {
    const slug = slugify(`${"a".repeat(9)} ${"b".repeat(20)}`, 10);
    expect(slug).toBe("aaaaaaaaa");
    expect(slugify("x".repeat(200))).toHaveLength(64);
  });
});

describe("componentNameFromSlug", () => {
  it("PascalCases the slug", () => {
    expect(componentNameFromSlug("nested-sidebar")).toBe("NestedSidebar");
    expect(componentNameFromSlug("card")).toBe("Card");
  });

  it("prefixes names that would start with a digit", () => {
    expect(componentNameFromSlug("3d-cards")).toBe("Recipe3dCards");
  });
});
