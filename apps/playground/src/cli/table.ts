import type { Recipe } from "../recipes-manifest.js";

const MAX_TITLE = 40;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** A plain-text table: slug, title, version, component count. */
export function formatRecipeTable(recipes: readonly Recipe[]): string {
  const header = ["SLUG", "TITLE", "VERSION", "COMPONENTS"];
  const rows = recipes.map((r) => [
    r.slug,
    truncate(r.title, MAX_TITLE),
    r.version,
    String(r.components.length),
  ]);
  const widths = header.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => row[i]?.length ?? 0)),
  );
  const line = (cells: string[]) =>
    cells
      .map((cell, i) =>
        i === cells.length - 1
          ? cell.padStart(widths[i] ?? 0)
          : cell.padEnd(widths[i] ?? 0),
      )
      .join("  ")
      .trimEnd();
  return [
    line(header),
    line(widths.map((w) => "-".repeat(w))),
    ...rows.map(line),
  ].join("\n");
}
