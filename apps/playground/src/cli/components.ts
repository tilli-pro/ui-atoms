import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { compareStrings } from "../recipes-manifest.js";

const SUBPATH_KEY = /^\.\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

function importTarget(entry: unknown): string | undefined {
  if (typeof entry === "string") return entry;
  if (typeof entry !== "object" || entry === null) return;
  const conditions = entry as Record<string, unknown>;
  const target = conditions.import ?? conditions.default;
  return typeof target === "string" ? target : undefined;
}

/**
 * The published component subpaths in a ui-atoms `exports` map. Only entries
 * generated from `src/components/<name>/` (see scripts/gen-exports.ts) count,
 * so `.`, `./package.json`, `./styles.css`, `./utils`, `./formatters` and
 * `./hooks` are all excluded.
 */
export function componentSubpaths(exportsMap: unknown): string[] {
  if (typeof exportsMap !== "object" || exportsMap === null) return [];
  const names: string[] = [];
  for (const [key, entry] of Object.entries(exportsMap)) {
    const name = SUBPATH_KEY.exec(key)?.[1];
    if (
      name !== undefined &&
      importTarget(entry) === `./dist/components/${name}/index.js`
    )
      names.push(name);
  }
  return names.sort(compareStrings);
}

/** Reads the installed `@tilli.dev/ui-atoms` package.json (read-only). */
export function loadComponentSubpaths(
  fromUrl: string = import.meta.url,
): string[] {
  const require = createRequire(fromUrl);
  const pkgPath = require.resolve("@tilli.dev/ui-atoms/package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    exports?: unknown;
  };
  return componentSubpaths(pkg.exports);
}
