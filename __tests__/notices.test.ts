import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const text = readFileSync(
  resolve(import.meta.dirname, "..", "THIRD-PARTY-NOTICES.md"),
  "utf8",
);

describe("THIRD-PARTY-NOTICES", () => {
  it("carries every required third-party notice", () => {
    for (const heading of [
      "## coss ui",
      "## shadcn/ui",
      "## @base-ui/react",
      "## lucide",
      "## cva",
      "## @daypicker/react",
      "## tailwind-merge",
      "## clsx",
      "## tw-animate-css",
    ]) {
      expect(text, heading).toContain(heading);
    }
    expect(text).toContain("Apache License, Version 2.0");
    expect(text).toContain("ISC License");
    expect(text).toContain("MIT License");
    expect(text).toContain("LICENSING.md");
  });
  it("records the pinned coss revision the components were re-based on", () => {
    const lock = JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, "..", "scripts", "coss", "coss-lock.json"),
        "utf8",
      ),
    ) as { revision: string };
    expect(
      text,
      "the notices must quote the same revision coss-lock.json pins",
    ).toContain(lock.revision);
    expect(text).toContain(".coss-base/");
  });
  it("records the digest of the shadcn base the sidebar was taken from", () => {
    const lock = JSON.parse(
      readFileSync(
        resolve(
          import.meta.dirname,
          "..",
          "scripts",
          "shadcn",
          "shadcn-lock.json",
        ),
        "utf8",
      ),
    ) as { files: Record<string, { sha256: string }> };
    for (const [name, entry] of Object.entries(lock.files))
      expect(
        text,
        `the notices must quote the digest shadcn-lock.json pins for ${name}`,
      ).toContain(entry.sha256);
    expect(text).toContain(".shadcn-base/");
  });
  it("has no unfilled markers", () => {
    expect(text).not.toMatch(/PASTE|TBD|TODO/);
  });
});
