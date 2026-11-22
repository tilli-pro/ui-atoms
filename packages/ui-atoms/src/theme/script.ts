import {
  defineThemeConfig,
  type ThemeConfig,
  type ThemeConfigOverrides,
} from "./config.js";

/**
 * Runs in the browser before first paint, serialised with `Function.prototype.toString`.
 * It must therefore be self-contained: no imports, no closures, nothing but its argument
 * and browser globals. It is exported so the same code path is type-checked and tested.
 */
export function applyThemeBeforePaint(config: ThemeConfig): void {
  try {
    const root = document.documentElement;
    const matches = (query: string) => {
      try {
        return window.matchMedia(query).matches;
      } catch {
        return false;
      }
    };
    const stored = (key: string) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    };
    const apply = (
      attribute: string | false,
      value: string,
      all: Record<string, string>,
    ) => {
      if (attribute === false) return;
      if (attribute === "class") {
        for (const key in all) {
          const other = all[key];
          if (other && other !== value) root.classList.remove(other);
        }
        root.classList.add(value);
      } else {
        root.setAttribute(attribute, value);
      }
    };

    const savedTheme = stored(config.storageKey);
    const theme =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : config.defaultTheme;
    apply(
      config.attribute,
      theme === "system"
        ? config.values[
            matches("(prefers-color-scheme: dark)")
              ? "system-dark"
              : "system-light"
          ]
        : config.values[theme],
      config.values,
    );

    if (config.contrastAttribute !== false) {
      const savedContrast = stored(config.contrastStorageKey);
      const contrast =
        savedContrast === "normal" ||
        savedContrast === "high" ||
        savedContrast === "system"
          ? savedContrast
          : config.defaultContrast;
      apply(
        config.contrastAttribute,
        contrast === "system"
          ? config.contrastValues[
              matches("(prefers-contrast: more)")
                ? "system-high"
                : "system-normal"
            ]
          : config.contrastValues[contrast],
        config.contrastValues,
      );
    }

    if (config.disableTransitionsOnChange) {
      const style = document.createElement("style");
      style.setAttribute("data-theme-transition", "");
      style.textContent = "*,*::before,*::after{transition:none!important}";
      document.head.appendChild(style);
      const remove = () => style.remove();
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(() => requestAnimationFrame(remove));
      else setTimeout(remove, 32);
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
