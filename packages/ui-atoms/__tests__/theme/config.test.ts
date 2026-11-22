import { describe, expect, it } from "vitest";
import {
  defineThemeConfig,
  isContrastPreference,
  isThemePreference,
} from "../../src/theme/config.js";

describe("defineThemeConfig", () => {
  it("fills every default", () => {
    expect(defineThemeConfig()).toEqual({
      attribute: "data-theme",
      contrastAttribute: "data-contrast",
      storageKey: "theme",
      contrastStorageKey: "contrast",
      defaultTheme: "system",
      defaultContrast: "system",
      values: {
        light: "light",
        dark: "dark",
        "system-light": "system-light",
        "system-dark": "system-dark",
      },
      contrastValues: {
        normal: "normal",
        high: "high",
        "system-normal": "system-normal",
        "system-high": "system-high",
      },
      disableTransitionsOnChange: true,
    });
  });
  it("keeps the other written values when one is overridden", () => {
    const config = defineThemeConfig({
      values: { dark: "night" },
      contrastValues: { high: "more" },
    });
    expect(config.values).toEqual({
      light: "light",
      dark: "night",
      "system-light": "system-light",
      "system-dark": "system-dark",
    });
    expect(config.contrastValues["system-high"]).toBe("system-high");
    expect(config.contrastValues.high).toBe("more");
  });
  it("ignores overrides that are undefined", () => {
    expect(defineThemeConfig({ storageKey: undefined }).storageKey).toBe(
      "theme",
    );
  });
  it("recognises preferences and nothing else", () => {
    expect(["light", "dark", "system"].every(isThemePreference)).toBe(true);
    expect(isThemePreference("purple")).toBe(false);
    expect(isThemePreference("system-dark")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
    expect(["normal", "high", "system"].every(isContrastPreference)).toBe(true);
    expect(isContrastPreference("dark")).toBe(false);
  });
});
