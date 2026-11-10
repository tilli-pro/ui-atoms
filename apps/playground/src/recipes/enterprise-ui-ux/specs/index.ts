import { itemSlug } from "../routing.js";
import { financeSpecs } from "./finance.js";
import { networkSpecs } from "./network.js";
import { salesSpecs } from "./sales.js";
import type { ModuleKey, SectionItem } from "../modules.js";
import type { ListSpec, ModuleSpecs } from "./types.js";

/** Each module's mock specs; every module task adds its entry. */
export const moduleSpecs: Partial<Record<ModuleKey, ModuleSpecs>> = {
  finance: financeSpecs,
  network: networkSpecs,
  sales: salesSpecs,
};

export const specFor = (
  module: ModuleKey,
  item?: SectionItem,
): ListSpec | undefined =>
  item ? moduleSpecs[module]?.items[itemSlug(item)] : undefined;
