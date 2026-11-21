/**
 * The shape of `recipes.json`, shared by the playground app (which builds its
 * routes from it) and the `recipe` CLI (which is the only thing that should
 * write it). Everything here is pure: no DOM, no Node APIs.
 */

export interface ChangelogEntry {
  version: string;
  /** Local calendar date, `YYYY-MM-DD`. */
  date: string;
  changes: string;
}

export interface Recipe {
  /** Kebab-case; also the module file name (`src/recipes/<slug>.tsx`) and the URL segment. */
  slug: string;
  title: string;
  description: string;
  /** Semver `MAJOR.MINOR.PATCH`, starting at `1.0.0`. */
  version: string;
  /** ui-atoms subpaths the recipe imports, e.g. `"sidebar"` for `@tilli.dev/ui-atoms/sidebar`. */
  components: string[];
  /** Oldest first; the last entry's version equals `version`. */
  changelog: ChangelogEntry[];
}

export const LIMITS = {
  title: 100,
  slug: 64,
  description: 1024,
  changes: 2048,
} as const;

export const INITIAL_VERSION = "1.0.0";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** `<slug>.tsx`, or `<slug>/index.tsx` for a folder recipe; the slug is the last path segment before either. */
const MODULE_PATH_PATTERN = /(?:^|\/)([^/]+)(?:\.tsx|\/index\.tsx)$/;

const RECIPE_KEYS = [
  "slug",
  "title",
  "description",
  "version",
  "components",
  "changelog",
] as const;
const CHANGELOG_KEYS = ["version", "date", "changes"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectString(
  obj: Record<string, unknown>,
  key: string,
  where: string,
): string {
  const value = obj[key];
  if (typeof value !== "string")
    throw new Error(`${where}: "${key}" must be a string`);
  return value;
}

function expectKeys(
  obj: Record<string, unknown>,
  keys: readonly string[],
  where: string,
): void {
  const unknown = Object.keys(obj).filter((k) => !keys.includes(k));
  if (unknown.length > 0)
    throw new Error(`${where}: unknown key(s) ${unknown.join(", ")}`);
}

function parseChangelogEntry(value: unknown, where: string): ChangelogEntry {
  if (!isRecord(value)) throw new Error(`${where}: must be an object`);
  expectKeys(value, CHANGELOG_KEYS, where);
  const version = expectString(value, "version", where);
  const date = expectString(value, "date", where);
  const changes = expectString(value, "changes", where);
  if (!SEMVER_PATTERN.test(version))
    throw new Error(
      `${where}: "${version}" is not a MAJOR.MINOR.PATCH version`,
    );
  if (!DATE_PATTERN.test(date))
    throw new Error(`${where}: date "${date}" is not YYYY-MM-DD`);
  if (changes.trim() === "" || changes.length > LIMITS.changes)
    throw new Error(
      `${where}: changes must be 1-${LIMITS.changes} characters long`,
    );
  return { version, date, changes };
}

function parseRecipe(value: unknown, index: number): Recipe {
  const where = `recipes.json[${index}]`;
  if (!isRecord(value)) throw new Error(`${where}: must be an object`);
  expectKeys(value, RECIPE_KEYS, where);
  const slug = expectString(value, "slug", where);
  const title = expectString(value, "title", where);
  const description = expectString(value, "description", where);
  const version = expectString(value, "version", where);
  if (!SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug)
    throw new Error(`${where}: slug "${slug}" is not a kebab-case slug`);
  if (title.trim() === "" || title.length > LIMITS.title)
    throw new Error(`${where}: title must be 1-${LIMITS.title} characters`);
  if (description.length > LIMITS.description)
    throw new Error(
      `${where}: description exceeds ${LIMITS.description} characters`,
    );
  if (!SEMVER_PATTERN.test(version))
    throw new Error(
      `${where}: "${version}" is not a MAJOR.MINOR.PATCH version`,
    );

  const components = value.components;
  if (
    !Array.isArray(components) ||
    components.some((c) => typeof c !== "string" || !SLUG_PATTERN.test(c))
  )
    throw new Error(`${where}: components must be an array of subpath names`);
  if (new Set(components).size !== components.length)
    throw new Error(`${where}: components contains duplicates`);

  const changelog = value.changelog;
  if (!Array.isArray(changelog) || changelog.length === 0)
    throw new Error(`${where}: changelog must be a non-empty array`);
  const entries = changelog.map((entry, i) =>
    parseChangelogEntry(entry, `${where}.changelog[${i}]`),
  );
  if (entries.at(-1)?.version !== version)
    throw new Error(
      `${where}: the last changelog entry must be for version ${version}`,
    );

  return {
    slug,
    title,
    description,
    version,
    components: components as string[],
    changelog: entries,
  };
}

/** Validates the parsed contents of `recipes.json`; throws a descriptive error. */
export function parseManifest(value: unknown): Recipe[] {
  if (!Array.isArray(value))
    throw new Error("recipes.json: must be an array of recipes");
  const recipes = value.map(parseRecipe);
  const seen = new Set<string>();
  for (const { slug } of recipes) {
    if (seen.has(slug))
      throw new Error(`recipes.json: duplicate slug "${slug}"`);
    seen.add(slug);
  }
  return recipes;
}

export function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/** Canonical order: recipes by slug, each recipe's components alphabetically. */
export function normalizeManifest(recipes: readonly Recipe[]): Recipe[] {
  return [...recipes]
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      version: r.version,
      components: [...r.components].sort(compareStrings),
      changelog: r.changelog.map((e) => ({
        version: e.version,
        date: e.date,
        changes: e.changes,
      })),
    }))
    .sort((a, b) => compareStrings(a.slug, b.slug));
}

const LINE_WIDTH = 80;
const INDENT = "  ";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function isPrimitive(value: Json): value is string | number | boolean | null {
  return value === null || typeof value !== "object";
}

function allPrimitive(values: readonly Json[]): boolean {
  for (const value of values) if (!isPrimitive(value)) return false;
  return true;
}

/**
 * Prints JSON exactly as the repo's Biome formatter (`expand: "auto"`,
 * 80 columns, 2-space indent) would, so CLI writes never leave a formatting
 * diff: objects always one key per line; arrays of primitives on one line
 * when the whole line (indent, key, value and trailing comma) fits in 80
 * columns, otherwise one element per line.
 */
function printJson(
  value: Json,
  depth: number,
  column: number,
  suffix: number,
): string {
  if (isPrimitive(value)) return JSON.stringify(value);
  const pad = INDENT.repeat(depth + 1);
  const close = INDENT.repeat(depth);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (allPrimitive(value)) {
      const flat = `[${value.map((v) => JSON.stringify(v)).join(", ")}]`;
      if (column + flat.length + suffix <= LINE_WIDTH) return flat;
    }
    const items = value.map(
      (v, i) =>
        `${pad}${printJson(v, depth + 1, pad.length, i < value.length - 1 ? 1 : 0)}`,
    );
    return `[\n${items.join(",\n")}\n${close}]`;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  const lines = entries.map(([key, v], i) => {
    const prefix = `${pad}${JSON.stringify(key)}: `;
    const rest = printJson(
      v,
      depth + 1,
      prefix.length,
      i < entries.length - 1 ? 1 : 0,
    );
    return `${prefix}${rest}`;
  });
  return `{\n${lines.join(",\n")}\n${close}}`;
}

/** Serializes in canonical order and Biome-stable formatting, with a trailing newline. */
export function serializeManifest(recipes: readonly Recipe[]): string {
  const normalized = normalizeManifest(recipes) as unknown as Json;
  return `${printJson(normalized, 0, 0, 0)}\n`;
}

/** `./recipes/nested-sidebar.tsx` -> `nested-sidebar`; `./recipes/nested-sidebar/index.tsx` -> `nested-sidebar`. */
export function slugFromModulePath(path: string): string | undefined {
  return MODULE_PATH_PATTERN.exec(path)?.[1];
}

/** Which manifest entries have no module, and which modules have no entry. */
export function diffRecipeModules(
  manifestSlugs: readonly string[],
  moduleSlugs: readonly string[],
): { missingModules: string[]; missingEntries: string[] } {
  const modules = new Set(moduleSlugs);
  const entries = new Set(manifestSlugs);
  return {
    missingModules: manifestSlugs.filter((s) => !modules.has(s)).sort(),
    missingEntries: moduleSlugs.filter((s) => !entries.has(s)).sort(),
  };
}
