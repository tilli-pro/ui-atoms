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
 * The recipe's internal route, `#/<module>` or `#/<module>/<item>`: a module
 * view (its dashboard), or one of its menu items as its own view. Anything
 * unknown falls back to the module, then to Enterprise.
 */
export type Route = { module: ModuleKey; item?: SectionItem };

export const routeFromHash = (hash: string): Route => {
  const [moduleKey = "", slug] = hash.replace(HASH_PREFIX, "").split("/");
  if (!isModuleKey(moduleKey)) return { module: "enterprise" };
  if (slug === undefined) return { module: moduleKey };
  const item = itemsOf(moduleKey).find(
    (candidate) => itemSlug(candidate) === slug,
  );
  return item ? { module: moduleKey, item } : { module: moduleKey };
};

export const hashFor = (module: ModuleKey, item?: SectionItem): string =>
  item ? `#/${module}/${itemSlug(item)}` : `#/${module}`;
