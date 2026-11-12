import {
  isModuleKey,
  itemsOf,
  type ModuleKey,
  type SectionItem,
} from "./modules.js";

const HASH_PREFIX = /^#\/?/;
const SPACES = /\s+/g;

/** URL segment of a menu item: "Accounts Payable" → "accounts-payable". */
export const itemSlug = (item: SectionItem): string =>
  item.label.toLowerCase().replace(SPACES, "-");

/**
 * The recipe's internal route, `#/<module>`, `#/<module>/<item>` or
 * `#/<module>/<item>/<id>`: a module view (its dashboard), one of its menu
 * items as its own view, or a record of that item. The id is meaningful only
 * when the item's list spec has a `detail` (resolved in `index.tsx` to avoid a
 * specs <-> routing import cycle). Anything unknown falls back to the module,
 * then to Enterprise.
 */
export type Route = { module: ModuleKey; item?: SectionItem; id?: string };

export const routeFromHash = (hash: string): Route => {
  const [moduleKey = "", slug, id] = hash.replace(HASH_PREFIX, "").split("/");
  if (!isModuleKey(moduleKey)) return { module: "enterprise" };
  if (slug === undefined) return { module: moduleKey };
  const item = itemsOf(moduleKey).find(
    (candidate) => itemSlug(candidate) === slug,
  );
  if (!item) return { module: moduleKey };
  return id ? { module: moduleKey, item, id } : { module: moduleKey, item };
};

export const hashFor = (
  module: ModuleKey,
  item?: SectionItem,
  id?: string,
): string => {
  if (!item) return `#/${module}`;
  return id
    ? `#/${module}/${itemSlug(item)}/${id}`
    : `#/${module}/${itemSlug(item)}`;
};
