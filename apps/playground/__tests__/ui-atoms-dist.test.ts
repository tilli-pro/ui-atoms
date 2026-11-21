import { describe, expect, it } from "vitest";

const DIST_BUTTON = /\/dist\/components\/button\/index\.js$/;

describe("playground consumes @tilli.dev/ui-atoms through its exports map (dist)", () => {
  it("resolves the package from dist, not src", async () => {
    const mod = await import("@tilli.dev/ui-atoms/button");
    // dist output is compiled JS: no JSX source markers survive
    expect(typeof mod.Button).toBe("function");
    const resolved = import.meta.resolve("@tilli.dev/ui-atoms/button");
    expect(resolved).toMatch(DIST_BUTTON);
  });
});
