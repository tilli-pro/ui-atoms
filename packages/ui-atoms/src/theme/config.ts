/**
 * Theme configuration, shared by the store, the hook and the pre-paint script so the
 * three cannot disagree. No DOM access and no `"use client"`: this module is imported on
 * the server to generate the script.
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type ContrastPreference = "normal" | "high" | "system";
export type ResolvedContrast = "normal" | "high";
export type ThemeAttribute = "class" | `data-${string}`;

export type ThemeValueKey = "light" | "dark" | "system-light" | "system-dark";
export type ContrastValueKey =
  | "normal"
  | "high"
  | "system-normal"
  | "system-high";

export interface ThemeConfig {
  /** Where the theme is written. Default `"data-theme"`. */
  attribute: ThemeAttribute;
  /** Where contrast is written; `false` disables the axis. Default `"data-contrast"`. */
  contrastAttribute: ThemeAttribute | false;
  /** Default `"theme"`. */
  storageKey: string;
  /** Default `"contrast"`. */
  contrastStorageKey: string;
  /** Default `"system"`. */
  defaultTheme: ThemePreference;
  /** Default `"system"`. */
  defaultContrast: ContrastPreference;
  /** What is written for each state. Defaults: light, dark, system-light, system-dark. */
  values: Record<ThemeValueKey, string>;
  /** Defaults: normal, high, system-normal, system-high. */
  contrastValues: Record<ContrastValueKey, string>;
  /** Suppress CSS transitions while a change is applied. Default `true`. */
  disableTransitionsOnChange: boolean;
}

/** What a consumer passes: any subset, with the two value maps overridable key by key. */
export type ThemeConfigOverrides = {
  [K in Exclude<keyof ThemeConfig, "values" | "contrastValues">]?:
    | ThemeConfig[K]
    | undefined;
} & {
  values?: Partial<Record<ThemeValueKey, string>> | undefined;
  contrastValues?: Partial<Record<ContrastValueKey, string>> | undefined;
};

const THEME_PREFERENCES: readonly unknown[] = ["light", "dark", "system"];
const CONTRAST_PREFERENCES: readonly unknown[] = ["normal", "high", "system"];

export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value);
}

export function isContrastPreference(
  value: unknown,
): value is ContrastPreference {
  return CONTRAST_PREFERENCES.includes(value);
}

function defined<T extends object>(object: T | undefined): Partial<T> {
  const out: Partial<T> = {};
  if (!object) return out;
  for (const key of Object.keys(object) as (keyof T)[])
    if (object[key] !== undefined) out[key] = object[key];
  return out;
}

export function defineThemeConfig(
  overrides: ThemeConfigOverrides = {},
): ThemeConfig {
  const { values, contrastValues, ...rest } = overrides;
  return {
    attribute: "data-theme",
    contrastAttribute: "data-contrast",
    storageKey: "theme",
    contrastStorageKey: "contrast",
    defaultTheme: "system",
    defaultContrast: "system",
    disableTransitionsOnChange: true,
    ...(defined(rest) as Partial<ThemeConfig>),
    values: {
      light: "light",
      dark: "dark",
      "system-light": "system-light",
      "system-dark": "system-dark",
      ...defined(values),
    },
    contrastValues: {
      normal: "normal",
      high: "high",
      "system-normal": "system-normal",
      "system-high": "system-high",
      ...defined(contrastValues),
    },
  };
}
