import { describe, expect, it } from "vitest";
import * as icons from "../src/index.js";

describe("@tilli.dev/icons scaffold", () => {
  it("builds with an empty export surface", () => {
    expect(Object.keys(icons)).toEqual([]);
  });
});
