import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createRecipe,
  deleteRecipe,
  modulePath,
  type PlaygroundPaths,
  readManifest,
  resolvePaths,
  versionRecipe,
} from "../../src/cli/files.js";
import { serializeManifest } from "../../src/recipes-manifest.js";
import { makeRecipe } from "../helpers/recipes.js";

let paths: PlaygroundPaths;

beforeEach(() => {
  paths = resolvePaths(mkdtempSync(join(tmpdir(), "playground-recipes-")));
  mkdirSync(paths.recipesDir, { recursive: true });
  writeFileSync(
    paths.manifest,
    serializeManifest([makeRecipe("nested-sidebar")]),
  );
  writeFileSync(
    modulePath(paths, "nested-sidebar"),
    "export default function X() {}\n",
  );
});

afterEach(() => {
  rmSync(paths.root, { recursive: true, force: true });
});

const manifestText = () => readFileSync(paths.manifest, "utf8");

describe("resolvePaths", () => {
  it("defaults to the playground package", () => {
    const real = resolvePaths();
    expect(existsSync(real.manifest)).toBe(true);
    expect(real.recipesDir).toMatch(/apps[/\\]playground[/\\]src[/\\]recipes$/);
  });
});

describe("createRecipe", () => {
  it("writes the module from the template and the canonical manifest", () => {
    const recipe = createRecipe(
      paths,
      { name: "Login form", components: ["input", "button"] },
      "2026-11-08",
      ["button", "input"],
    );
    expect(recipe.slug).toBe("login-form");
    expect(readFileSync(modulePath(paths, "login-form"), "utf8")).toContain(
      'import {} from "@tilli.dev/ui-atoms/button";\nimport {} from "@tilli.dev/ui-atoms/input";',
    );
    const manifest = readManifest(paths);
    expect(manifest.map((r) => r.slug)).toEqual([
      "login-form",
      "nested-sidebar",
    ]);
    expect(manifestText()).toBe(serializeManifest(manifest));
  });

  it("changes nothing on invalid input", () => {
    const before = manifestText();
    expect(() =>
      createRecipe(paths, { name: "Nested sidebar" }, "2026-11-08"),
    ).toThrow(/already exists/);
    expect(() =>
      createRecipe(
        paths,
        { name: "Ok", description: "x".repeat(2000) },
        "2026-11-08",
      ),
    ).toThrow(/1024/);
    expect(manifestText()).toBe(before);
    expect(readdirSync(paths.recipesDir)).toEqual(["nested-sidebar.tsx"]);
  });

  it("never overwrites an orphan module file", () => {
    writeFileSync(modulePath(paths, "orphan"), "// mine\n");
    const before = manifestText();
    expect(() => createRecipe(paths, { name: "Orphan" }, "2026-11-08")).toThrow(
      /already exists but has no recipes.json entry/,
    );
    expect(readFileSync(modulePath(paths, "orphan"), "utf8")).toBe("// mine\n");
    expect(manifestText()).toBe(before);
  });

  it("refuses to touch an invalid recipes.json", () => {
    writeFileSync(paths.manifest, "{ not json");
    expect(() => createRecipe(paths, { name: "New" }, "2026-11-08")).toThrow(
      /not valid JSON/,
    );
    expect(manifestText()).toBe("{ not json");
    expect(existsSync(modulePath(paths, "new"))).toBe(false);
  });
});

describe("versionRecipe", () => {
  it("bumps and appends a changelog entry", () => {
    versionRecipe(paths, "nested-sidebar", "major", "Rewrite", "2026-11-08");
    expect(readManifest(paths)).toMatchObject([
      {
        version: "2.0.0",
        changelog: [
          { version: "1.0.0" },
          { version: "2.0.0", date: "2026-11-08", changes: "Rewrite" },
        ],
      },
    ]);
  });
});

describe("deleteRecipe", () => {
  it("removes the entry and the module", () => {
    expect(deleteRecipe(paths, "nested-sidebar")).toBe(true);
    expect(readManifest(paths)).toEqual([]);
    expect(manifestText()).toBe("[]\n");
    expect(existsSync(modulePath(paths, "nested-sidebar"))).toBe(false);
  });

  it("changes nothing for an unknown slug", () => {
    const before = manifestText();
    expect(() => deleteRecipe(paths, "missing")).toThrow(/No recipe/);
    expect(manifestText()).toBe(before);
  });
});
