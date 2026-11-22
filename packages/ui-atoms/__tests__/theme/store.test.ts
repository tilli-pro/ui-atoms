import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createThemeStore } from "../../src/theme/store.js";
import { flush, mockMedia } from "./helpers.js";

let el: HTMLElement;

beforeEach(() => {
  el = document.createElement("div");
  document.body.append(el);
  localStorage.clear();
});
afterEach(() => {
  el.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("createThemeStore", () => {
  it("writes system-dark for a system preference when the OS is dark, and reports both fields", () => {
    mockMedia({ dark: true });
    const store = createThemeStore({}, () => el);
    store.setTheme("system");
    expect(el.getAttribute("data-theme")).toBe("system-dark");
    expect(store.getSnapshot()).toMatchObject({
      theme: "system",
      resolvedTheme: "dark",
    });
    expect(localStorage.getItem("theme")).toBe("system");
  });
  it("writes the plain value for an explicit choice", () => {
    mockMedia({ dark: true });
    const store = createThemeStore({}, () => el);
    store.setTheme("light");
    expect(el.getAttribute("data-theme")).toBe("light");
    expect(store.getSnapshot()).toMatchObject({
      theme: "light",
      resolvedTheme: "light",
    });
  });
  it("follows the OS while the preference is system, and stops when it is not", () => {
    const media = mockMedia({ dark: true });
    const store = createThemeStore({}, () => el);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme("system");
    media.set({ dark: false });
    expect(el.getAttribute("data-theme")).toBe("system-light");
    expect(store.getSnapshot().resolvedTheme).toBe("light");
    store.setTheme("dark");
    media.set({ dark: true });
    media.set({ dark: false });
    expect(el.getAttribute("data-theme")).toBe("dark");
  });
  it("applies the stored preference on first subscribe when nothing has set the attribute", () => {
    mockMedia({ dark: true });
    localStorage.setItem("theme", "light");
    const store = createThemeStore({}, () => el);
    expect(el.hasAttribute("data-theme")).toBe(false);
    store.subscribe(() => undefined);
    expect(el.getAttribute("data-theme")).toBe("light");
  });
  it("leaves an attribute something else already set", () => {
    mockMedia({ dark: false });
    el.setAttribute("data-theme", "dark");
    const store = createThemeStore({}, () => el);
    store.subscribe(() => undefined);
    expect(el.getAttribute("data-theme")).toBe("dark");
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
  });
  it("picks up an attribute set by something else", async () => {
    mockMedia({ dark: false });
    const store = createThemeStore({ defaultTheme: "light" }, () => el);
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.getSnapshot().resolvedTheme).toBe("light");
    el.setAttribute("data-theme", "dark");
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
  });
  it("notifies subscribers of an outside change even if a snapshot was read first", async () => {
    // A render that happens to call getSnapshot() between the change and the observer
    // callback must not swallow the notification the other subscribers are owed.
    mockMedia({ dark: false });
    const store = createThemeStore({ defaultTheme: "light" }, () => el);
    const listener = vi.fn();
    store.subscribe(listener);
    el.setAttribute("data-theme", "dark");
    store.getSnapshot();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
  });
  it("notifies once per change it makes itself", async () => {
    mockMedia();
    const store = createThemeStore({}, () => el);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme("dark");
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("still applies the theme when storage throws (Review Focus 1)", () => {
    mockMedia();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied");
    });
    const store = createThemeStore({}, () => el);
    expect(() => store.setTheme("dark")).not.toThrow();
    expect(el.getAttribute("data-theme")).toBe("dark");
    expect(store.getSnapshot()).toMatchObject({
      theme: "dark",
      resolvedTheme: "dark",
    });
  });
  it("works without matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    const store = createThemeStore({}, () => el);
    expect(() => store.subscribe(() => undefined)).not.toThrow();
    expect(store.getSnapshot().resolvedTheme).toBe("light");
  });
  it("ignores a stored value that is not a preference (Review Focus 2)", () => {
    mockMedia();
    localStorage.setItem("theme", "purple");
    const store = createThemeStore({ defaultTheme: "light" }, () => el);
    expect(store.getSnapshot().theme).toBe("light");
    store.subscribe(() => undefined);
    expect(el.getAttribute("data-theme")).toBe("light");
  });
  it("with attribute class, swaps one theme class and keeps the rest (Review Focus 3)", () => {
    mockMedia();
    el.className = "app shell";
    const store = createThemeStore(
      {
        attribute: "class",
        values: {
          light: "light",
          dark: "dark",
          "system-light": "light",
          "system-dark": "dark",
        },
      },
      () => el,
    );
    store.setTheme("dark");
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
    store.setTheme("light");
    expect([...el.classList].sort()).toEqual(["app", "light", "shell"]);
  });
  it("returns the same snapshot object until something changes", () => {
    mockMedia();
    const store = createThemeStore({}, () => el);
    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);
    store.setTheme("dark");
    expect(store.getSnapshot()).not.toBe(first);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });
  it("gives the defaults, resolved light and normal, as the server snapshot", () => {
    mockMedia({ dark: true, contrast: true });
    const store = createThemeStore({ defaultTheme: "dark" }, () => el);
    expect(store.getServerSnapshot()).toEqual({
      theme: "dark",
      resolvedTheme: "dark",
      contrast: "system",
      resolvedContrast: "normal",
    });
    expect(createThemeStore({}, () => el).getServerSnapshot()).toEqual({
      theme: "system",
      resolvedTheme: "light",
      contrast: "system",
      resolvedContrast: "normal",
    });
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
  });
  it("writes and resolves contrast the same way", () => {
    const media = mockMedia({ contrast: true });
    const store = createThemeStore({}, () => el);
    store.subscribe(() => undefined);
    expect(el.getAttribute("data-contrast")).toBe("system-high");
    expect(store.getSnapshot()).toMatchObject({
      contrast: "system",
      resolvedContrast: "high",
    });
    media.set({ contrast: false });
    expect(el.getAttribute("data-contrast")).toBe("system-normal");
    store.setContrast("high");
    expect(el.getAttribute("data-contrast")).toBe("high");
    expect(localStorage.getItem("contrast")).toBe("high");
  });
  it("disables the contrast axis with contrastAttribute false", () => {
    mockMedia({ contrast: true });
    const store = createThemeStore({ contrastAttribute: false }, () => el);
    store.subscribe(() => undefined);
    store.setContrast("high");
    expect(el.hasAttribute("data-contrast")).toBe(false);
    expect(localStorage.getItem("contrast")).toBeNull();
    expect(store.getSnapshot().resolvedContrast).toBe("normal");
  });
  it("syncs a preference changed in another tab", () => {
    mockMedia();
    const store = createThemeStore({}, () => el);
    const listener = vi.fn();
    store.subscribe(listener);
    localStorage.setItem("theme", "dark");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "theme", newValue: "dark" }),
    );
    expect(el.getAttribute("data-theme")).toBe("dark");
    expect(store.getSnapshot().theme).toBe("dark");
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("detaches every listener when the last subscriber leaves", async () => {
    const media = mockMedia();
    const store = createThemeStore({}, () => el);
    const listener = vi.fn();
    const off = store.subscribe(listener);
    expect(media.listenerCount()).toBe(2);
    off();
    expect(media.listenerCount()).toBe(0);
    el.setAttribute("data-theme", "dark");
    await flush();
    expect(listener).not.toHaveBeenCalled();
  });
  it("does not touch the target until it is used", () => {
    const target = vi.fn(() => el);
    createThemeStore({}, target);
    expect(target).not.toHaveBeenCalled();
  });
  it("suppresses transitions during a change and restores them", async () => {
    mockMedia();
    const store = createThemeStore({}, () => el);
    store.setTheme("dark");
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).toBeNull();
  });
  it("leaves transitions alone when disableTransitionsOnChange is false", () => {
    mockMedia();
    const store = createThemeStore(
      { disableTransitionsOnChange: false },
      () => el,
    );
    store.setTheme("dark");
    expect(
      document.head.querySelector("style[data-theme-transition]"),
    ).toBeNull();
  });
});
