import { describe, expect, it } from "vitest";
import { bumpVersion } from "../../src/cli/semver.js";

describe("bumpVersion", () => {
  it.each([
    ["1.0.0", "patch", "1.0.1"],
    ["1.0.9", "patch", "1.0.10"],
    ["1.2.3", "minor", "1.3.0"],
    ["1.2.3", "major", "2.0.0"],
    ["0.9.9", "major", "1.0.0"],
  ] as const)("%s + %s = %s", (from, bump, to) => {
    expect(bumpVersion(from, bump)).toBe(to);
  });

  it.each(["1.0", "v1.0.0", "1.0.0-beta.1", "01.0.0", ""])(
    "rejects %j",
    (version) => {
      expect(() => bumpVersion(version, "patch")).toThrow(/MAJOR.MINOR.PATCH/);
    },
  );
});
