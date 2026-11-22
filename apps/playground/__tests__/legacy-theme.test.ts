import { describe, expect, it } from "vitest";
import { legacyDarkPreference } from "../src/legacy-theme.js";

const stored = (value: unknown) => JSON.stringify({ type: "boolean", value });

describe("legacyDarkPreference", () => {
  it("maps the old persisted dark toggle to a theme", () => {
    expect(legacyDarkPreference(stored(true))).toBe("dark");
    expect(legacyDarkPreference(stored(false))).toBe("light");
  });
  it("returns nothing when there is no usable value", () => {
    expect(legacyDarkPreference(null)).toBeUndefined();
    expect(legacyDarkPreference("not json")).toBeUndefined();
    expect(legacyDarkPreference(stored("yes"))).toBeUndefined();
    expect(legacyDarkPreference("null")).toBeUndefined();
  });
});
