"use client";

import {
  type ContrastPreference,
  defineThemeConfig,
  isContrastPreference,
  isThemePreference,
  type ResolvedContrast,
  type ResolvedTheme,
  type ThemeAttribute,
  type ThemeConfigOverrides,
  type ThemePreference,
} from "./config.js";

export interface ThemeState {
  /** What the user chose. */
  theme: ThemePreference;
  /** What is showing. */
  resolvedTheme: ResolvedTheme;
  contrast: ContrastPreference;
  resolvedContrast: ResolvedContrast;
}

export interface ThemeStore {
  /** Referentially stable until something changes. */
  getSnapshot(): ThemeState;
  /** The configured defaults; `system` resolves as light / normal. */
  getServerSnapshot(): ThemeState;
  subscribe(listener: () => void): () => void;
  setTheme(theme: ThemePreference): void;
  setContrast(contrast: ContrastPreference): void;
}

const DARK_QUERY = "(prefers-color-scheme: dark)";
const CONTRAST_QUERY = "(prefers-contrast: more)";
const NO_TRANSITIONS = "*,*::before,*::after{transition:none!important}";

/**
 * One axis (theme or contrast): a stored preference, an attribute that carries the
 * applied value, and a media query that answers `system`.
 */
interface Axis<R extends string> {
  attribute: ThemeAttribute | false;
  storageKey: string;
  fallback: R | "system";
  isPreference(value: unknown): value is R | "system";
  query: string;
  /** Resolved value when the query matches / does not. */
  on: R;
  off: R;
  /** Attribute values, keyed by `on`, `off`, `system-on`, `system-off`. */
  written: { on: string; off: string; systemOn: string; systemOff: string };
  /** A storage write failed, so the choice lives here for this page's lifetime. */
  memory?: R | "system";
}

function mediaMatches(query: string): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(query).matches
    );
  } catch {
    return false;
  }
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function preference<R extends string>(axis: Axis<R>): R | "system" {
  if (axis.memory !== undefined) return axis.memory;
  const stored = readStored(axis.storageKey);
  return axis.isPreference(stored) ? stored : axis.fallback;
}

/** What the attribute currently says, or `undefined` when it holds no value we know. */
function applied<R extends string>(
  axis: Axis<R>,
  el: HTMLElement,
): R | undefined {
  if (axis.attribute === false) return;
  const { on, off, systemOn, systemOff } = axis.written;
  const has =
    axis.attribute === "class"
      ? (value: string) => el.classList.contains(value)
      : (value: string) => el.getAttribute(axis.attribute as string) === value;
  if (has(on) || has(systemOn)) return axis.on;
  if (has(off) || has(systemOff)) return axis.off;
  return;
}

function resolve<R extends string>(axis: Axis<R>, el: HTMLElement): R {
  const fromDom = applied(axis, el);
  if (fromDom !== undefined) return fromDom;
  if (axis.attribute === false) return axis.off;
  const chosen = preference(axis);
  if (chosen === axis.on) return axis.on;
  if (chosen === axis.off) return axis.off;
  return mediaMatches(axis.query) ? axis.on : axis.off;
}

function write<R extends string>(axis: Axis<R>, el: HTMLElement): void {
  if (axis.attribute === false) return;
  const chosen = preference(axis);
  const { on, off, systemOn, systemOff } = axis.written;
  let value: string;
  if (chosen === axis.on) value = on;
  else if (chosen === axis.off) value = off;
  else value = mediaMatches(axis.query) ? systemOn : systemOff;
  if (axis.attribute === "class") {
    for (const other of [on, off, systemOn, systemOff])
      if (other !== value) el.classList.remove(other);
    el.classList.add(value);
  } else if (el.getAttribute(axis.attribute) !== value) {
    el.setAttribute(axis.attribute, value);
  }
}

function suppressTransitions(): void {
  const style = document.createElement("style");
  style.setAttribute("data-theme-transition", "");
  style.textContent = NO_TRANSITIONS;
  document.head.append(style);
  const remove = () => style.remove();
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(() => requestAnimationFrame(remove));
  else setTimeout(remove, 32);
}

export function createThemeStore(
  overrides: ThemeConfigOverrides = {},
  target: () => HTMLElement = () => document.documentElement,
): ThemeStore {
  const config = defineThemeConfig(overrides);

  const themeAxis: Axis<ResolvedTheme> = {
    attribute: config.attribute,
    storageKey: config.storageKey,
    fallback: config.defaultTheme,
    isPreference: isThemePreference,
    query: DARK_QUERY,
    on: "dark",
    off: "light",
    written: {
      on: config.values.dark,
      off: config.values.light,
      systemOn: config.values["system-dark"],
      systemOff: config.values["system-light"],
    },
  };
  const contrastAxis: Axis<ResolvedContrast> = {
    attribute: config.contrastAttribute,
    storageKey: config.contrastStorageKey,
    fallback: config.defaultContrast,
    isPreference: isContrastPreference,
    query: CONTRAST_QUERY,
    on: "high",
    off: "normal",
    written: {
      on: config.contrastValues.high,
      off: config.contrastValues.normal,
      systemOn: config.contrastValues["system-high"],
      systemOff: config.contrastValues["system-normal"],
    },
  };

  const serverSnapshot: ThemeState = {
    theme: config.defaultTheme,
    resolvedTheme: config.defaultTheme === "dark" ? "dark" : "light",
    contrast: config.defaultContrast,
    resolvedContrast: config.defaultContrast === "high" ? "high" : "normal",
  };

  const listeners = new Set<() => void>();
  let snapshot: ThemeState | undefined;
  let stop: (() => void) | undefined;

  function read(): ThemeState {
    const el = target();
    return {
      theme: preference(themeAxis),
      resolvedTheme: resolve(themeAxis, el),
      contrast: preference(contrastAxis),
      resolvedContrast: resolve(contrastAxis, el),
    };
  }

  /** Re-reads the DOM and storage; returns whether anything differs from last time. */
  function refresh(): boolean {
    const next = read();
    const changed =
      !snapshot ||
      snapshot.theme !== next.theme ||
      snapshot.resolvedTheme !== next.resolvedTheme ||
      snapshot.contrast !== next.contrast ||
      snapshot.resolvedContrast !== next.resolvedContrast;
    if (changed) snapshot = next;
    return changed;
  }

  function emit(): void {
    if (refresh()) for (const listener of [...listeners]) listener();
  }

  function start(): () => void {
    const el = target();
    // Without a pre-paint script nothing has written the attribute yet; with one, or with
    // anything else that set it, what is there stands.
    refresh();
    if (applied(themeAxis, el) === undefined) write(themeAxis, el);
    if (applied(contrastAxis, el) === undefined) write(contrastAxis, el);
    refresh();

    const cleanups: (() => void)[] = [];

    const attributes = [themeAxis.attribute, contrastAxis.attribute].filter(
      (attribute): attribute is ThemeAttribute => attribute !== false,
    );
    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(emit);
      observer.observe(el, {
        attributes: true,
        attributeFilter: [...new Set(attributes)],
      });
      cleanups.push(() => observer.disconnect());
    }

    const follow = <R extends string>(axis: Axis<R>) => {
      if (axis.attribute === false) return;
      if (typeof window.matchMedia !== "function") return;
      const media = window.matchMedia(axis.query);
      const onChange = () => {
        if (preference(axis) !== axis.on && preference(axis) !== axis.off)
          write(axis, target());
        emit();
      };
      media.addEventListener("change", onChange);
      cleanups.push(() => media.removeEventListener("change", onChange));
    };
    follow(themeAxis);
    follow(contrastAxis);

    const onStorage = (event: StorageEvent) => {
      // `key` is null when the whole store was cleared.
      const sync = <R extends string>(axis: Axis<R>) => {
        if (event.key !== null && event.key !== axis.storageKey) return;
        delete axis.memory;
        write(axis, target());
      };
      sync(themeAxis);
      sync(contrastAxis);
      emit();
    };
    window.addEventListener("storage", onStorage);
    cleanups.push(() => window.removeEventListener("storage", onStorage));

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }

  function choose<R extends string>(axis: Axis<R>, value: R | "system"): void {
    if (axis.attribute === false) return;
    try {
      window.localStorage.setItem(axis.storageKey, value);
      delete axis.memory;
    } catch {
      axis.memory = value;
    }
    if (config.disableTransitionsOnChange) suppressTransitions();
    write(axis, target());
    emit();
  }

  return {
    getSnapshot() {
      if (typeof document === "undefined") return serverSnapshot;
      // While subscribed, the observer and listeners keep the snapshot current and owe
      // every subscriber a notification; refreshing here would swallow it.
      if (!(stop && snapshot)) refresh();
      return snapshot as ThemeState;
    },
    getServerSnapshot: () => serverSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) stop = start();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stop?.();
          stop = undefined;
        }
      };
    },
    setTheme: (theme) => choose(themeAxis, theme),
    setContrast: (contrast) => choose(contrastAxis, contrast),
  };
}

export const defaultThemeStore: ThemeStore = createThemeStore();
