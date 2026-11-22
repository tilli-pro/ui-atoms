import * as React from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyThemeTokens,
  THEME_TOKENS,
  type ThemeTokens,
  tokenToCssVariable,
  useCustomTheme,
} from "../../src/theme/index.js";
import { compileCss, declarationsFor } from "../helpers/compile-css.js";

let el: HTMLElement;
const inline = () => el.getAttribute("style") ?? "";

beforeEach(() => {
  el = document.createElement("div");
  document.body.append(el);
});
afterEach(() => {
  el.remove();
  document.documentElement.removeAttribute("style");
});

describe("theme tokens", () => {
  it("THEME_TOKENS is exactly the custom properties of theme-tilli-light", async () => {
    const out = await compileCss('@import "./styles/core.css";', [
      "theme-tilli-light",
    ]);
    const declared = Object.keys(declarationsFor(out, ".theme-tilli-light"));
    expect(declared.length).toBeGreaterThan(30);
    expect(THEME_TOKENS.map(tokenToCssVariable).sort()).toEqual(
      declared.sort(),
    );
  });
  it("maps camelCase names to their custom property", () => {
    expect(tokenToCssVariable("mutedForeground")).toBe("--muted-foreground");
    expect(tokenToCssVariable("chart1")).toBe("--chart-1");
    expect(tokenToCssVariable("sidebarPrimaryForeground")).toBe(
      "--sidebar-primary-foreground",
    );
  });
  it("restores previous inline values on cleanup, removing ones that were absent (Review Focus 5)", () => {
    el.style.setProperty("--primary", "red");
    el.style.setProperty("color", "black");
    const restore = applyThemeTokens({ primary: "blue", ring: "green" }, el);
    expect(el.style.getPropertyValue("--primary")).toBe("blue");
    expect(el.style.getPropertyValue("--ring")).toBe("green");
    restore();
    expect(el.style.getPropertyValue("--primary")).toBe("red");
    expect(el.style.getPropertyValue("--ring")).toBe("");
    expect(el.style.getPropertyValue("color")).toBe("black");
  });
  it("restores an !important value with its priority", () => {
    el.style.setProperty("--primary", "red", "important");
    applyThemeTokens({ primary: "blue" }, el)();
    expect(el.style.getPropertyValue("--primary")).toBe("red");
    expect(el.style.getPropertyPriority("--primary")).toBe("important");
  });
  it("defaults to <html>", () => {
    const restore = applyThemeTokens({ primary: "blue" });
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "blue",
    );
    restore();
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe(
      "",
    );
  });
  it("ignores keys that are not tokens, and undefined values", () => {
    const restore = applyThemeTokens(
      { nope: "x", color: "red", primary: undefined } as never,
      el,
    );
    expect(inline()).toBe("");
    expect(() => restore()).not.toThrow();
  });
});

describe("useCustomTheme", () => {
  const useOn = (tokens: ThemeTokens | undefined) => {
    const ref = React.useRef(el);
    useCustomTheme(tokens, { target: ref });
  };

  it("applies on mount, re-applies when tokens change, and cleans up on unmount", () => {
    const { rerender, unmount } = renderHook(useOn, {
      initialProps: { primary: "blue", ring: "green" } as ThemeTokens,
    });
    expect(el.style.getPropertyValue("--primary")).toBe("blue");
    rerender({ primary: "purple" });
    expect(el.style.getPropertyValue("--primary")).toBe("purple");
    expect(el.style.getPropertyValue("--ring")).toBe("");
    unmount();
    expect(inline()).toBe("");
  });
  it("does not re-apply for an equal map with a new identity", () => {
    const { rerender } = renderHook(useOn, {
      initialProps: { primary: "blue", ring: "green" } as ThemeTokens,
    });
    // Something else changes the property; an equal map must not stomp on it.
    el.style.setProperty("--primary", "orange");
    rerender({ ring: "green", primary: "blue" });
    expect(el.style.getPropertyValue("--primary")).toBe("orange");
  });
  it("does nothing for undefined", () => {
    const { unmount } = renderHook(useOn, { initialProps: undefined });
    expect(inline()).toBe("");
    unmount();
    expect(inline()).toBe("");
  });
});
