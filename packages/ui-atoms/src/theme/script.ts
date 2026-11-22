import {
  defineThemeConfig,
  type ThemeConfig,
  type ThemeConfigOverrides,
} from "./config.js";

/**
 * Runs in the browser before first paint, serialised with `Function.prototype.toString`.
 * It must therefore be self-contained: no imports, no closures, nothing but its argument
 * and browser globals. It also declares no named function or arrow of its own, because a
 * bundler option such as esbuild's `keepNames` wraps those in a helper defined outside
 * this function, which would not exist in the page. It is exported so the same code path
 * is type-checked and tested.
 */
export function applyThemeBeforePaint(config: ThemeConfig): void {
  try {
    const root = document.documentElement;
    // [attribute, storage key, default, query, values, value when it matches, when not]
    const axes: [
      string | false,
      string,
      string,
      string,
      Record<string, string>,
      string,
      string,
    ][] = [
      [
        config.attribute,
        config.storageKey,
        config.defaultTheme,
        "(prefers-color-scheme: dark)",
        config.values,
        "dark",
        "light",
      ],
      [
        config.contrastAttribute,
        config.contrastStorageKey,
        config.defaultContrast,
        "(prefers-contrast: more)",
        config.contrastValues,
        "high",
        "normal",
      ],
    ];
    for (const [attribute, key, fallback, query, values, on, off] of axes) {
      if (attribute === false) continue;
      let preference = fallback;
      try {
        const saved = window.localStorage.getItem(key);
        if (saved === on || saved === off || saved === "system")
          preference = saved;
      } catch {
        // Storage unavailable: use the default.
      }
      let state = preference;
      if (preference === "system") {
        let matches = false;
        try {
          matches = window.matchMedia(query).matches;
        } catch {
          // No matchMedia: treat as not matching.
        }
        state = `system-${matches ? on : off}`;
      }
      const value = values[state] ?? "";
      if (attribute === "class") {
        for (const name in values) {
          const other = values[name];
          if (other && other !== value) root.classList.remove(other);
        }
        if (value) root.classList.add(value);
      } else {
        root.setAttribute(attribute, value);
      }
    }

    if (config.disableTransitionsOnChange) {
      const style = document.createElement("style");
      style.setAttribute("data-theme-transition", "");
      if (config.nonce) style.setAttribute("nonce", config.nonce);
      style.textContent = "*,*::before,*::after{transition:none!important}";
      document.head.appendChild(style);
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(() =>
          requestAnimationFrame(() => style.remove()),
        );
      else setTimeout(() => style.remove(), 32);
    }
  } catch {
    // A theme that fails to apply early is applied by the store on mount; never break the page.
  }
}

/**
 * The source of a script that applies the stored theme before first paint. Inline it in
 * `<head>` (or render `<ThemeScript />`). Pass the same config the store and hook get.
 */
export function getThemeScript(overrides?: ThemeConfigOverrides): string {
  // `<` is escaped so no configured value can close the surrounding <script> element.
  const config = JSON.stringify(defineThemeConfig(overrides)).replace(
    /</g,
    "\\u003c",
  );
  return `(${applyThemeBeforePaint.toString()})(${config})`;
}
