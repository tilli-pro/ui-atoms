import { describe, expect, it } from "vitest";
import {
  formatArktypeValidationMessage,
  getCurrencySymbol,
} from "../src/formatters.js";

describe("formatters (ported verbatim from v2 lib/formatters.ts)", () => {
  it("splits the first camelCase word and capitalises it", () => {
    expect(formatArktypeValidationMessage("firstName must be a string")).toBe(
      "First name must be a string",
    );
    expect(formatArktypeValidationMessage("email must be valid")).toBe(
      "Email must be valid",
    );
    expect(formatArktypeValidationMessage("zip")).toBe("Zip");
  });
  it("returns the currency symbol for a locale/currency pair", () => {
    expect(getCurrencySymbol()).toBe("$");
    expect(getCurrencySymbol("en-US", "EUR")).toBe("€");
    expect(getCurrencySymbol("en-GB", "GBP")).toBe("£");
    // v2 fidelity quirk, kept verbatim: the helper reads formatToParts(0)[0], which is correct
    // only for symbol-leading locales; symbol-trailing locales (de-DE) return the first part ("0").
    // A downstream concern, ported as-is.
    expect(getCurrencySymbol("de-DE", "EUR")).toBe("0");
  });
});
