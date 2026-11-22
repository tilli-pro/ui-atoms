import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyThemeSeeds } from "../../src/theme/index.js";

let el: HTMLElement;

beforeEach(() => {
  el = document.createElement("div");
  document.body.append(el);
});
afterEach(() => {
  el.remove();
  document.documentElement.removeAttribute("style");
});

describe("applyThemeSeeds", () => {
  it("sets only the seeds given and restores exactly what was there", () => {
    el.style.setProperty("--seed-primary", "red");
    const restore = applyThemeSeeds({ primary: "oklch(28% 0.06 315)" }, el);
    expect(el.style.getPropertyValue("--seed-primary")).toBe(
      "oklch(28% 0.06 315)",
    );
    expect(el.style.getPropertyValue("--seed-background")).toBe("");
    restore();
    expect(el.style.getPropertyValue("--seed-primary")).toBe("red");
  });
  it("sets both seeds and removes ones that were absent", () => {
    const restore = applyThemeSeeds(
      { primary: "navy", background: "ivory" },
      el,
    );
    expect(el.style.getPropertyValue("--seed-primary")).toBe("navy");
    expect(el.style.getPropertyValue("--seed-background")).toBe("ivory");
    restore();
    expect(el.getAttribute("style") ?? "").toBe("");
  });
  it("defaults to <html> and ignores unknown keys", () => {
    const restore = applyThemeSeeds({
      background: "ivory",
      accent: "pink",
    } as never);
    const style = document.documentElement.style;
    expect(style.getPropertyValue("--seed-background")).toBe("ivory");
    expect(style.getPropertyValue("--seed-accent")).toBe("");
    restore();
    expect(style.getPropertyValue("--seed-background")).toBe("");
  });
});
