import { describe, expect, it } from "vitest";
import { cn } from "../src/utils.js";

describe("cn", () => {
  it("merges tailwind classes with last-wins semantics (tailwind-merge) and clsx inputs", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", { "font-bold": true, hidden: false }, ["gap-2"])).toBe(
      "text-sm font-bold gap-2",
    );
    expect(cn(undefined, null, "", "x")).toBe("x");
  });
});
