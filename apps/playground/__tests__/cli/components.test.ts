import { describe, expect, it } from "vitest";
import {
  componentSubpaths,
  loadComponentSubpaths,
} from "../../src/cli/components.js";

const entry = (base: string) => ({
  types: `./dist/${base}.d.ts`,
  import: `./dist/${base}.js`,
  default: `./dist/${base}.js`,
});

describe("componentSubpaths", () => {
  it("keeps only generated component entries, sorted", () => {
    expect(
      componentSubpaths({
        ".": entry("index"),
        "./package.json": "./package.json",
        "./styles.css": "./dist/styles.css",
        "./utils": entry("utils"),
        "./formatters": entry("formatters"),
        "./hooks": entry("hooks/index"),
        "./sidebar": entry("components/sidebar/index"),
        "./alert-dialog": entry("components/alert-dialog/index"),
        "./button": entry("components/button/index"),
        "./mismatch": entry("components/other/index"),
      }),
    ).toEqual(["alert-dialog", "button", "sidebar"]);
  });

  it("tolerates a missing or malformed map", () => {
    expect(componentSubpaths(undefined)).toEqual([]);
    expect(componentSubpaths("./index.js")).toEqual([]);
  });
});

describe("loadComponentSubpaths", () => {
  it("reads the installed @tilli.dev/ui-atoms exports map", () => {
    const names = loadComponentSubpaths();
    expect(names).toEqual(
      expect.arrayContaining(["button", "card", "sidebar", "switch"]),
    );
    for (const excluded of ["utils", "hooks", "formatters", "styles.css"])
      expect(names).not.toContain(excluded);
  });
});
