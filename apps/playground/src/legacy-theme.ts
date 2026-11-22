/**
 * Before the playground used `@tilli.dev/ui-atoms/theme`, its control panel persisted a
 * `dark` boolean under `control:dark` as `{"type":"boolean","value":true}`. This reads
 * that raw value so a returning visitor keeps their choice.
 */
export const LEGACY_DARK_KEY = "control:dark";

export function legacyDarkPreference(
  raw: string | null,
): "dark" | "light" | undefined {
  if (raw === null) return;
  try {
    const value = (JSON.parse(raw) as { value?: unknown } | null)?.value;
    if (typeof value === "boolean") return value ? "dark" : "light";
  } catch {
    /* not JSON: nothing to migrate */
  }
  return;
}
