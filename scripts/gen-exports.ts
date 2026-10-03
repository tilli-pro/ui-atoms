#!/usr/bin/env tsx
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const PKG_DIR = resolve(import.meta.dirname, "..", "packages", "ui-atoms");

/**
 * Subpaths that exist in the source tree — and therefore in the generated exports map —
 * but that nobody has approved for publication yet. npm publishes are irreversible: a
 * version that ships one of these cannot be unshipped, only deprecated.
 *
 * `scripts/check-provisional.ts` therefore fails while this list is non-empty, and the
 * root `release` script runs it before `changeset publish`, so the block is mechanical
 * rather than a thing somebody has to remember. A new entry belongs here only while an
 * unanswered decision could still change or withdraw a subpath.
 */
export const PROVISIONAL: readonly string[] = [];

export function listComponentDirs(srcDir: string): string[] {
  const dir = join(srcDir, "components");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (d) => d.isDirectory() && existsSync(join(dir, d.name, "index.tsx")),
    )
    .map((d) => d.name)
    .sort();
}

const entry = (base: string) => ({
  types: `./dist/${base}.d.ts`,
  import: `./dist/${base}.js`,
  default: `./dist/${base}.js`,
});

export function generateExports(
  componentDirs: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    "./package.json": "./package.json",
    "./styles.css": "./dist/styles.css",
    "./utils": entry("utils"),
    "./formatters": entry("formatters"),
    "./hooks": entry("hooks/index"),
  };
  for (const name of componentDirs)
    out[`./${name}`] = entry(`components/${name}/index`);
  return out;
}

function main(): void {
  const check = process.argv.includes("--check");
  const pkgPath = join(PKG_DIR, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<
    string,
    unknown
  >;
  const next = generateExports(listComponentDirs(join(PKG_DIR, "src")));
  const current = JSON.stringify(pkg.exports ?? {}, null, 2);
  const wanted = JSON.stringify(next, null, 2);
  if (current === wanted) {
    console.log(
      `gen-exports: up to date (${Object.keys(next).length} entries)`,
    );
    return;
  }
  if (check) {
    console.error(
      "gen-exports: package.json exports is stale — run `pnpm gen-exports`",
    );
    process.exit(1);
  }
  pkg.exports = next;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`gen-exports: wrote ${Object.keys(next).length} entries`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(import.meta.filename)
)
  main();
