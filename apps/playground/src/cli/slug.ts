import { LIMITS } from "../recipes-manifest.js";

const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const STARTS_WITH_DIGIT = /^\d/;

/**
 * Derives a kebab-case slug from a free-form recipe name:
 * `"Nested Sidebar (v2)"` -> `"nested-sidebar-v2"`, `"Café menu"` -> `"cafe-menu"`.
 * Returns `""` when the name has no ASCII letters or digits at all.
 */
export function slugify(name: string, maxLength: number = LIMITS.slug): string {
  const slug = name
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, "-")
    .replace(EDGE_DASHES, "");
  return slug.slice(0, maxLength).replace(EDGE_DASHES, "");
}

/** `"nested-sidebar"` -> `"NestedSidebar"`; a leading digit gets a `Recipe` prefix. */
export function componentNameFromSlug(slug: string): string {
  const pascal = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return STARTS_WITH_DIGIT.test(pascal) || pascal === ""
    ? `Recipe${pascal}`
    : pascal;
}
