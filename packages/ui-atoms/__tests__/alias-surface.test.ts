import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The published alias surface, made mechanical.
 *
 * Two rules, and they are the whole policy:
 *
 *  1. An alias may only exist if the upstream base ships that name. We re-export what
 *     upstream re-exports; we never invent a compatibility name of our own, because an
 *     invented alias lets a call site that the migration codemod was supposed to rewrite
 *     keep compiling against a part whose meaning changed.
 *  2. The names listed in RETIRED are not published at all. Each belongs to a part set
 *     whose v2 spelling now means something different (`DialogContent`, `DrawerOverlay`)
 *     or whose whole family was renamed (`DropdownMenu*` → `Menu*`), so keeping the old
 *     name would resolve, type-check and render the wrong thing with no error.
 *
 * Published names cannot be withdrawn without a major bump, which is why this runs
 * before 0.1.0 rather than after it.
 */
const SRC = resolve(import.meta.dirname, "..", "src");
const BASE = resolve(import.meta.dirname, "..", "..", "..", ".coss-base");

/** Names that must not appear anywhere in the published surface. */
const RETIRED = [
  /^DropdownMenu/,
  /^DialogOverlay$/,
  /^DialogContent$/,
  /^TooltipContent$/,
  /^DrawerOverlay$/,
];

const EXPORT_BLOCK_RE = /export\s+(?:type\s+)?\{([^}]*)\}/g;
const ALIAS_RE = /^\s*(\w+)\s+as\s+(\w+)\s*,?\s*$/;
const PRIMITIVE_RE = /Primitive$/;
const LINE_RE = /[\n,]/;

const NAME_RE = /^\s*(\w+)\s*,?\s*$/;

/** Every `X as Y` inside an export block of `source`, as the exported name `Y`. */
export function exportedAliases(source: string): string[] {
  const out: string[] = [];
  for (const block of source.matchAll(EXPORT_BLOCK_RE))
    for (const line of (block[1] ?? "").split(LINE_RE)) {
      const match = ALIAS_RE.exec(line.endsWith(",") ? line : `${line},`);
      if (match?.[2]) out.push(match[2]);
    }
  return out;
}

/** Every name an export block publishes, aliased or not. */
export function exportedNames(source: string): string[] {
  const out: string[] = [];
  for (const block of source.matchAll(EXPORT_BLOCK_RE))
    for (const line of (block[1] ?? "").split(LINE_RE)) {
      const alias = ALIAS_RE.exec(line);
      if (alias?.[2]) {
        out.push(alias[2]);
        continue;
      }
      const plain = NAME_RE.exec(line);
      if (plain?.[1] && plain[1] !== "type") out.push(plain[1]);
    }
  return out;
}

const components = readdirSync(join(SRC, "components"), {
  withFileTypes: true,
})
  .filter(
    (d) =>
      d.isDirectory() &&
      existsSync(join(SRC, "components", d.name, "index.tsx")),
  )
  .map((d) => d.name)
  .sort();

const aliases = components.map(
  (name) =>
    [
      name,
      exportedAliases(
        readFileSync(join(SRC, "components", name, "index.tsx"), "utf8"),
      ),
    ] as const,
);

describe("published aliases", () => {
  it("never invents a name upstream does not ship", () => {
    const invented: string[] = [];
    for (const [name, names] of aliases) {
      const base = join(BASE, `${name}.tsx`);
      // A component with no coss counterpart has no upstream surface to match.
      if (!existsSync(base)) continue;
      const text = readFileSync(base, "utf8");
      for (const alias of names) {
        // `*Primitive` is our spelling of an upstream part, not a new name.
        const stem = alias.replace(PRIMITIVE_RE, "");
        if (!new RegExp(`\\b${stem}\\b`).test(text))
          invented.push(`${name}: ${alias}`);
      }
    }
    expect(invented).toEqual([]);
  });

  it("publishes none of the retired v2 names", () => {
    const found: string[] = [];
    for (const name of components) {
      const source = readFileSync(
        join(SRC, "components", name, "index.tsx"),
        "utf8",
      );
      for (const exported of exportedNames(source))
        if (RETIRED.some((re) => re.test(exported)))
          found.push(`${name}: ${exported}`);
    }
    expect(found).toEqual([]);
  });
});
