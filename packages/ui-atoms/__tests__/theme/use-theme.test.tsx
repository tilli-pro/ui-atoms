import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../../src/theme/index.js";
import { mockMedia } from "./helpers.js";

const html = document.documentElement;

function reset() {
  html.removeAttribute("data-theme");
  html.removeAttribute("data-contrast");
  html.removeAttribute("class");
  localStorage.clear();
}

function Probe() {
  const { theme, resolvedTheme } = useTheme();
  return <output>{`${theme}/${resolvedTheme}`}</output>;
}

beforeEach(() => {
  reset();
  mockMedia({ dark: false });
});
afterEach(() => {
  reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useTheme", () => {
  it("works with no provider, against <html>", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme("dark"));
    expect(html.dataset.theme).toBe("dark");
    expect(result.current).toMatchObject({
      theme: "dark",
      resolvedTheme: "dark",
    });
  });
  it("applies the stored preference on mount when no script ran", () => {
    localStorage.setItem("theme", "dark");
    render(<Probe />);
    expect(html.dataset.theme).toBe("dark");
    expect(screen.getByRole("status").textContent).toBe("dark/dark");
  });
  it("re-renders when the attribute is changed from outside", async () => {
    render(<Probe />);
    expect(screen.getByRole("status").textContent).toBe("system/light");
    html.setAttribute("data-theme", "dark");
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe("system/dark"),
    );
  });
  it("keeps every consumer in step", () => {
    const { result } = renderHook(() => useTheme());
    render(<Probe />);
    act(() => result.current.setTheme("dark"));
    expect(screen.getByRole("status").textContent).toBe("dark/dark");
  });
  it("returns a stable object between changes", () => {
    const { result, rerender } = renderHook(() => useTheme());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
  it("exposes contrast the same way", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setContrast("high"));
    expect(html.dataset.contrast).toBe("high");
    expect(result.current).toMatchObject({
      contrast: "high",
      resolvedContrast: "high",
    });
  });
  it("server-renders the defaults without touching document (Review Focus 4)", () => {
    html.setAttribute("data-theme", "dark");
    const read = vi.spyOn(html, "getAttribute");
    expect(renderToString(<Probe />)).toContain("system/light");
    expect(read).not.toHaveBeenCalled();
  });
  it("hydrates without a mismatch warning when the script already set dark", async () => {
    const markup = renderToString(<Probe />);
    const container = document.createElement("div");
    container.innerHTML = markup;
    document.body.append(container);
    html.setAttribute("data-theme", "dark");
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Probe />);
    });
    expect(error).not.toHaveBeenCalled();
    expect(container.textContent).toBe("system/dark");
    act(() => root?.unmount());
    container.remove();
  });
});

describe("ThemeProvider", () => {
  const config = {
    attribute: "class",
    storageKey: "scoped-theme",
    contrastAttribute: false,
    values: {
      light: "light",
      dark: "dark",
      "system-light": "light",
      "system-dark": "dark",
    },
  } as const;

  function Scoped() {
    const ref = React.useRef<HTMLDivElement>(null);
    return (
      <div className="panel" data-testid="scope" ref={ref}>
        <ThemeProvider config={config} target={ref}>
          <Toggle />
        </ThemeProvider>
      </div>
    );
  }
  function Toggle() {
    const { resolvedTheme, setTheme } = useTheme();
    return (
      <button onClick={() => setTheme("dark")} type="button">
        {resolvedTheme}
      </button>
    );
  }

  it("scopes config and target to its subtree", () => {
    render(<Scoped />);
    const scope = screen.getByTestId("scope");
    expect([...scope.classList].sort()).toEqual(["light", "panel"]);
    act(() => screen.getByRole("button").click());
    expect([...scope.classList].sort()).toEqual(["dark", "panel"]);
    expect(screen.getByRole("button").textContent).toBe("dark");
    expect(localStorage.getItem("scoped-theme")).toBe("dark");
    expect(html.hasAttribute("data-theme")).toBe(false);
    expect(html.className).toBe("");
  });
  it("leaves consumers outside it on the default store", () => {
    render(
      <>
        <Scoped />
        <Probe />
      </>,
    );
    act(() => screen.getByRole("button").click());
    expect(screen.getByRole("status").textContent).toBe("system/light");
  });
});
