import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyThemeBeforePaint,
  getThemeScript,
} from "../../src/theme/script.js";
import { createThemeStore } from "../../src/theme/store.js";
import { ThemeScript } from "../../src/theme/theme-script.js";
import { mockMedia } from "./helpers.js";
import type { ThemeConfigOverrides } from "../../src/theme/config.js";

const html = document.documentElement;
const classValues = {
  light: "light",
  dark: "dark",
  "system-light": "light",
  "system-dark": "dark",
};

function run(config?: ThemeConfigOverrides) {
  new Function(getThemeScript(config))();
}

function reset() {
  html.removeAttribute("data-theme");
  html.removeAttribute("data-contrast");
  html.removeAttribute("class");
  localStorage.clear();
  for (const style of document.head.querySelectorAll("style")) style.remove();
}

beforeEach(reset);
afterEach(() => {
  reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getThemeScript", () => {
  it("applies a stored choice", () => {
    mockMedia();
    localStorage.setItem("theme", "dark");
    run();
    expect(html.dataset.theme).toBe("dark");
  });
  it("resolves system to system-dark / system-light from the OS", () => {
    mockMedia({ dark: true });
    run();
    expect(html.dataset.theme).toBe("system-dark");
    mockMedia({ dark: false });
    run();
    expect(html.dataset.theme).toBe("system-light");
  });
  it("treats an unknown stored value as the default (Review Focus 2)", () => {
    localStorage.setItem("theme", "purple");
    mockMedia({ dark: false });
    run();
    expect(html.dataset.theme).toBe("system-light");
  });
  it("applies contrast, and skips it when the axis is disabled", () => {
    mockMedia({ contrast: true });
    run();
    expect(html.dataset.contrast).toBe("system-high");
    localStorage.setItem("contrast", "normal");
    run();
    expect(html.dataset.contrast).toBe("normal");
    html.removeAttribute("data-contrast");
    run({ contrastAttribute: false });
    expect(html.hasAttribute("data-contrast")).toBe(false);
  });
  it("writes a class when configured, leaving other classes", () => {
    mockMedia({ dark: false });
    html.className = "app dark";
    run({ attribute: "class", values: classValues });
    expect([...html.classList].sort()).toEqual(["app", "light"]);
  });
  it("does not throw when storage is unavailable", () => {
    mockMedia({ dark: true });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => run()).not.toThrow();
    expect(html.dataset.theme).toBe("system-dark");
  });
  it("does not throw without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(() => run()).not.toThrow();
    expect(html.dataset.theme).toBe("system-light");
  });
  it("agrees with the store for every stored preference and OS setting", () => {
    for (const config of [
      {},
      { attribute: "class", values: classValues },
    ] as ThemeConfigOverrides[])
      for (const dark of [true, false])
        for (const pref of ["light", "dark", "system"] as const) {
          reset();
          mockMedia({ dark, contrast: dark });
          localStorage.setItem("theme", pref);
          run(config);
          const fromScript = [
            html.dataset.theme,
            html.className,
            html.dataset.contrast,
          ];
          reset();
          createThemeStore(config).setTheme(pref);
          createThemeStore(config).setContrast("system");
          expect(
            [html.dataset.theme, html.className, html.dataset.contrast],
            `${JSON.stringify(config)} dark=${dark} pref=${pref}`,
          ).toEqual(fromScript);
        }
  });
  it("suppresses transitions for two frames when configured", async () => {
    mockMedia();
    run();
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).toBeNull();
    run({ disableTransitionsOnChange: false });
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).toBeNull();
  });
  it("is one self-contained expression", () => {
    const source = getThemeScript();
    expect(source).not.toMatch(/\bimport\b|\brequire\(/);
    expect(source.startsWith("(")).toBe(true);
    expect(source.endsWith(")")).toBe(true);
  });
  it("has no named inner function a bundler could wrap in an outside helper", () => {
    // esbuild's keepNames rewrites `const f = () => …` to `__name(() => …, "f")`, and
    // __name lives outside the serialised function: the script would throw and, since it
    // swallows errors, silently apply nothing.
    const body = applyThemeBeforePaint.toString();
    expect(body).not.toMatch(
      /\b(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?(?:\(|function\b|\w+\s*=>)/,
    );
    expect(body.slice(body.indexOf("{"))).not.toMatch(/\bfunction\s+\w+/);
  });
  it("treats an empty class value as no class", () => {
    mockMedia({ dark: false });
    html.className = "app dark";
    run({
      attribute: "class",
      values: {
        light: "",
        "system-light": "",
        dark: "dark",
        "system-dark": "dark",
      },
    });
    expect([...html.classList]).toEqual(["app"]);
    localStorage.setItem("theme", "dark");
    run({
      attribute: "class",
      values: {
        light: "",
        "system-light": "",
        dark: "dark",
        "system-dark": "dark",
      },
    });
    expect([...html.classList].sort()).toEqual(["app", "dark"]);
  });
  it("puts the nonce on the style it injects", () => {
    mockMedia();
    run({ nonce: "abc" });
    expect(
      document.head
        .querySelector("style[data-theme-transition]")
        ?.getAttribute("nonce"),
    ).toBe("abc");
  });
  it("cannot be broken out of by a configured value", () => {
    const source = getThemeScript({ storageKey: "</script><script>alert(1)" });
    expect(source).not.toContain("</script>");
    localStorage.setItem("</script><script>alert(1)", "dark");
    mockMedia();
    new Function(source)();
    expect(html.dataset.theme).toBe("dark");
  });
});

describe("ThemeScript", () => {
  it("inlines the source and passes the nonce", () => {
    const { container } = render(<ThemeScript nonce="abc" />);
    const script = container.querySelector("script");
    expect(script?.getAttribute("nonce")).toBe("abc");
    expect(script?.textContent).toBe(getThemeScript({ nonce: "abc" }));
  });
  it("generates from the config it is given", () => {
    const config = { storageKey: "app-theme" };
    const { container } = render(<ThemeScript config={config} />);
    expect(container.querySelector("script")?.textContent).toBe(
      getThemeScript(config),
    );
  });
});
