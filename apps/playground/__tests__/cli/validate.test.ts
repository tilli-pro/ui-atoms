import { describe, expect, it } from "vitest";
import {
  validateChanges,
  validateDescription,
  validateRecipeName,
} from "../../src/cli/validate.js";

describe("validateRecipeName", () => {
  it("accepts a fresh name", () => {
    expect(validateRecipeName("Settings dialog", ["nested-sidebar"])).toBe(
      undefined,
    );
  });

  it("requires a name", () => {
    expect(validateRecipeName(undefined, [])).toMatch(/required/);
    expect(validateRecipeName("   ", [])).toMatch(/required/);
  });

  it("refuses a name whose slug already exists", () => {
    expect(validateRecipeName("Nested Sidebar!", ["nested-sidebar"])).toMatch(
      /"nested-sidebar" already exists/,
    );
  });

  it("refuses names longer than 100 characters", () => {
    expect(validateRecipeName("a".repeat(100), [])).toBe(undefined);
    expect(validateRecipeName("a".repeat(101), [])).toMatch(/at most 100/);
  });

  it("refuses names without anything to slug", () => {
    expect(validateRecipeName("???", [])).toMatch(/letter or digit/);
  });

  it("refuses control characters", () => {
    expect(validateRecipeName("bad\u0007name", [])).toMatch(/control/);
  });
});

describe("validateDescription", () => {
  it("is optional", () => {
    expect(validateDescription(undefined)).toBe(undefined);
    expect(validateDescription("")).toBe(undefined);
  });

  it("allows up to 1024 characters", () => {
    expect(validateDescription("d".repeat(1024))).toBe(undefined);
    expect(validateDescription("d".repeat(1025))).toMatch(/at most 1024/);
  });

  it("measures the trimmed value", () => {
    expect(validateDescription(`  ${"d".repeat(1024)}  `)).toBe(undefined);
  });

  it("refuses control characters", () => {
    expect(validateDescription("line\nbreak")).toMatch(/control/);
  });
});

describe("validateChanges", () => {
  it("is required", () => {
    expect(validateChanges(undefined)).toMatch(/Describe/);
    expect(validateChanges("  ")).toMatch(/Describe/);
  });

  it("allows up to 2048 characters", () => {
    expect(validateChanges("c".repeat(2048))).toBe(undefined);
    expect(validateChanges("c".repeat(2049))).toMatch(/at most 2048/);
  });
});
