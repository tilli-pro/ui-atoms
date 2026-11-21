import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  findRecipeModule,
  listRecipeModules,
  recipeModuleRoot,
  recipeSourceFiles,
} from "../src/recipe-modules.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "playground-modules-"));
  writeFileSync(join(dir, "card.tsx"), "");
  mkdirSync(join(dir, "shell", "parts"), { recursive: true });
  writeFileSync(join(dir, "shell", "index.tsx"), "");
  writeFileSync(join(dir, "shell", "parts", "rail.tsx"), "");
  writeFileSync(join(dir, "shell", "theme.ts"), "");
  writeFileSync(join(dir, "shell", "notes.md"), "");
  mkdirSync(join(dir, "drafts")); // a folder without index.tsx is not a recipe
  writeFileSync(join(dir, "README.md"), "");
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("listRecipeModules", () => {
  it("lists <slug>.tsx files and <slug>/index.tsx folders, sorted by slug", () => {
    expect(listRecipeModules(dir)).toEqual([
      { slug: "card", path: join(dir, "card.tsx"), dir: false },
      { slug: "shell", path: join(dir, "shell", "index.tsx"), dir: true },
    ]);
  });
});

describe("findRecipeModule", () => {
  it("finds either form and prefers the file", () => {
    expect(findRecipeModule(dir, "card")?.dir).toBe(false);
    expect(findRecipeModule(dir, "shell")?.dir).toBe(true);
    expect(findRecipeModule(dir, "drafts")).toBe(undefined);
    writeFileSync(join(dir, "shell.tsx"), "");
    expect(findRecipeModule(dir, "shell")?.path).toBe(join(dir, "shell.tsx"));
  });
});

describe("recipeModuleRoot and recipeSourceFiles", () => {
  it("is the file itself for a single-file recipe", () => {
    const card = findRecipeModule(dir, "card");
    if (!card) throw new Error("card missing");
    expect(recipeModuleRoot(card)).toBe(join(dir, "card.tsx"));
    expect(recipeSourceFiles(card)).toEqual([join(dir, "card.tsx")]);
  });

  it("is the folder and every .ts/.tsx under it for a folder recipe", () => {
    const shell = findRecipeModule(dir, "shell");
    if (!shell) throw new Error("shell missing");
    expect(recipeModuleRoot(shell)).toBe(join(dir, "shell"));
    expect(recipeSourceFiles(shell)).toEqual([
      join(dir, "shell", "index.tsx"),
      join(dir, "shell", "parts", "rail.tsx"),
      join(dir, "shell", "theme.ts"),
    ]);
  });
});
